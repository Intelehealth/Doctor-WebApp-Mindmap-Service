const { convertDateToDDMMYYYY } = require('../handlers/utilityHelper');
const { patient_identifier, visit, Sequelize, encounter, person_name, person, person_attribute, visit_attribute } = require('../openmrs_models');
const { Op } = Sequelize;
/**
 * Function to get the visits with formated response.
 * @param {Array} visits 
 * @returns visits with formated response
 */
function getFormatedResponse(visits) {
  if (!visits) return [];
  const patient_identifier = visits[0].patient_identifier;
  const person = visits[0].person;
  const patient_name = visits[0].patient_name;
  const abhaAddress = patient_identifier?.find((identifier) => identifier?.identifier_type === 7)?.identifier ?? '';
  const openMRSId = patient_identifier?.find((identifier) => identifier?.identifier_type === 3)?.identifier ?? '';
  const careContexts = visits?.map((visit) => {
    return {
      "referenceNumber": visit?.encounters?.[0]?.uuid,
      "display": `OpConsult-1:${patient_name?.given_name} ${patient_name?.family_name}:${convertDateToDDMMYYYY(visit?.date_started)}`
    }
  });

  return {
    "abhaAddress": abhaAddress,
    "name": `${patient_name?.given_name} ${patient_name?.family_name}`,
    "gender": person?.gender,
    "dateOfBirth": person?.birthdate,
    "patientReference": openMRSId,
    "patientDisplay": patient_name?.given_name,
    "patientMobile": person?.attributes?.[0]?.value,
    "careContexts": careContexts,
  }
}
/**
 * Function to get the visit by abhaDetail
 * @param {object} param 
 * @returns visits array
 */
async function getVisitByAbhaDetails(whereParams) {
  const patientIdentifier = await patient_identifier.findOne({
    attributes: ['patient_id'],
    where: whereParams
  });
  if (patientIdentifier) {
    const visits = await this.getVisitsByPatientId(patientIdentifier.patient_id);
    return getFormatedResponse(visits);
  }
}

/**
 * Function to get the visit by mobile number with gender and name validation
 * @param {object} param 
 * @returns visits array
 */
async function getVisitByMobile({ mobileNumber, yearOfBirth, gender, name }) {
  const currentDate = new Date();
  const startDate = currentDate.setFullYear(yearOfBirth - 10)
  const endDate = currentDate.setFullYear(yearOfBirth + 10)
  const personAttribute = await person_attribute.findOne({
    attributes: ["person_id"],
    where: {
      person_attribute_type_id: { [Op.eq]: 8 },
      value: { [Op.eq]: mobileNumber }
    },
    include: [
      {
        model: person,
        as: "person",
        attributes: ["person_id", "gender", "birthdate"],
        where: {
          birthdate: {
            [Op.between]: [startDate, endDate]
          },
          gender: { [Op.eq]: gender }
        },
        include: [
          {
            model: person_name,
            as: "person_name",
            attributes: ["given_name", "middle_name", "family_name"],
          }
        ]
      }
    ]
  });

  if (!personAttribute || !name.includes(personAttribute?.person?.person_name?.family_name) || !name.includes(personAttribute?.person?.person_name?.given_name)) return null;
  const visits = await this.getVisitsByPatientId(personAttribute.person_id);
  return getFormatedResponse(visits);
}

module.exports = (function () {
  /**
  * Get patient & Visit
  * @param { string } visitUUID - Visit UUID
  */
  this.getVisitByUUID = async (visitUUID) => {
    try {
      if (!visitUUID) {
        throw new Error(
          "visitUUID is required."
        );
      }

      const url = `/ws/rest/v1/visit/${visitUUID}?v=custom:(location:(display),uuid,display,startDatetime,dateCreated,stopDatetime,encounters:(display,uuid,encounterDatetime,encounterType:(display),obs:(display,uuid,value,concept:(uuid,display)),encounterProviders:(display,provider:(uuid,attributes,person:(uuid,display,gender,age)))),patient:(uuid,identifiers:(identifier,identifierType:(name,uuid,display)),attributes,person:(display,gender,age)),attributes)`;
      const visit = await openmrsAxiosInstance.get(url);

      return {
        success: true,
        data: visit?.data,
        message: "Visit retrived successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  /**
  * Update the visit attribute
  * @param { string } visitUUID - Visit UUID
  * @param { object } attributes -  Visit Attributes
  */
  this.postAttribute = async (visitUUID, attributes) => {
    try {
      if (!visitUUID) {
        throw new Error(
          "visitUUID is required."
        );
      }
      const visit = await openmrsAxiosInstance.post(`/ws/rest/v1/visit/${visitUUID}/attribute`, attributes);
      return {
        success: true,
        data: visit?.data,
        message: "Visit attribute updated successfully!",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  /**
   * Get visits by abhaAddress and mobile numbers
   */
  this.getVisitBySearch = async (params) => {
    try {
      const mobileNumber = params?.verifiedIdentifiers.find((v) => v.type === 'Mobile')?.value
      const or = []
      if (params.abhaNumber) {
        or.push(params.abhaNumber);
      }
      if (params.abhaAddress) {
        or.push(params.abhaAddress);
      }
      let patientInfo = null;
      if (or.length) {
        patientInfo = await getVisitByAbhaDetails({
          identifier: {
            [Op.or]: or
          }
        })
      } else if (mobileNumber) {
        patientInfo = await getVisitByMobile({ mobileNumber, ...params })
      }
      return patientInfo;
    } catch (err) {
      console.log(err)
      return null;
    }
  };
  this.getVisitsByPatientId = async (patientId) => {
    const visits = await visit.findAll({
      where: {
        patient_id: { [Op.eq]: patientId },
      },
      attributes: ["uuid", "date_started"],
      include: [
        {
          model: encounter,
          as: "encounters",
          attributes: ["encounter_type", "encounter_datetime", 'uuid'],
          where: {
            [Op.or]: [{
              encounter_type: {
                [Op.eq]: 14
              }
            },
            {
              encounter_type: {
                [Op.eq]: 12
              }
            }]
          },
        },
        {
          model: visit_attribute,
          as: "attributes",
          attributes: ["attribute_type_id"],
          where: {
            "attribute_type_id": { [Op.ne]: 10 }
          }
        },
        {
          model: patient_identifier,
          as: "patient_identifier",
          attributes: ["identifier", "identifier_type"],
        },
        {
          model: person_name,
          as: "patient_name",
          attributes: ["given_name", "family_name"],
        },
        {
          model: person,
          as: "person",
          attributes: ["uuid", "gender", "birthdate"],
          include: [
            {
              model: person_attribute,
              as: "attributes",
              attributes: ["value", "person_attribute_type_id"],
              where: {
                "person_attribute_type_id": { [Op.eq]: 8 }
              },
              required: false,
            },
          ]
        },
      ],
      order: [["visit_id", "DESC"]]
    });
    if (visits) return visits;
    return null;
  };
  return this;
})();

const moment = require("moment");
const { axiosInstance } = require("../handlers/helper");
const { logStream } = require("../logger/index");
const {
  _createPerson,
  _createUser,
  _createProvider,
  _getUsers,
  _deleteUser,
  _updateUser,
  _getUser
} = require("../services/openmrs.service");
const buffer = require("buffer").Buffer;

module.exports = (function () {
  /**
   * Login API
   * @param {*} req
   * @param {*} res
   */
  this.login = async (req, res, next) => {
    try {
      logStream("debug", "API calling", "Login");
      const { username, password, rememberme } = req.body;
      const base64 = buffer.from(`${username}:${password}`).toString("base64");

      const data = await axiosInstance.get("/openmrs/ws/rest/v1/session", {
        headers: {
          Authorization: `Basic ${base64}`,
        },
      });

      const resp = {
        status: false,
      };

      if (data?.data?.authenticated) {
        const expiresIn = rememberme ? 3 : 15;
        resp.token = getToken(
          {
            sessionId: data?.data?.sessionId,
            userId: data?.data?.user?.uuid,
            name: data?.data?.user?.display,
          },
          moment()
            // .add(expiresIn, "days")
            .endOf("day")
            .unix()
        );
        resp.status = true;
      }
      logStream("debug", `Login Success for ${username}`, "Login");
      res.json(resp);
    } catch (error) {
      logStream("error", error.message);
      next(error);
    }
  };
  
  this.getUsers = async (req, res, next) => {
    try {
      logStream("debug", "API calling", "Get Users");
      const users = await _getUsers();
      logStream("debug", 'Got the user list', "Get Users");
      res.json({
        data: users.results,
        status: true
      });
    } catch (error) {
      logStream("error", error.message);
      next(error);
    }
  }; 

  this.createUser = async (req, res, next) => {
    try {
      logStream("debug", "API calling", "Create User");
      const {
        username,
        password,
        givenName,
        familyName,
        gender,
        birthdate,
        addresses,
        role,
        identifier,
        email,
      } = req.body;

      const personPayload = {
        givenName,
        familyName,
        gender,
        birthdate,
        addresses,
      };

      let roles;

      switch (role) {
        case "nurse":
          roles = JSON.parse(process.env.NURSE_ROLES);
          break;
        case "doctor":
          roles = JSON.parse(process.env.DOCTOR_ROLES);
          break;

        default:
          throw new Error("role not found");
      }

      const person = await _createPerson(personPayload);
      logStream("debug", "Person created successfully", "Create User");

      const userPayload = {
        username,
        password,
        personId: person.uuid,
        roles,
      };

      await _createUser(userPayload);
      logStream("debug", "User created successfully", "Create User");

      const providerPayload = {
        personId: person.uuid,
        identifier,
        attributes: [
          {
            attributeType: process.env.EMAIL_PROVIDER_ATTRIBUTE_TYPE,
            value: email,
          },
        ],
        retired: false,
      };

      await _createProvider(providerPayload);

      res.json({
        status: true,
        message: "User created successfully",
      });
    } catch (error) {
      const msg = error?.response?.data?.error?.message;
      next(msg ? new Error(msg) : error);
    }
  };

  this.deleteUser = async (req, res, next) => {
    try {
      const { uuid } = req.params;
      logStream("debug", "API calling", "Delete User");
      const result = await _deleteUser(uuid);
      logStream("debug", 'Deleted the user', "Delete User");
      res.json({
        message: "User deleted successfully",
        status: true
      });
    } catch (error) {
      logStream("error", error.message);
      next(error);
    }
  }; 

  this.updateUser = async (req, res, next)  => {
    try {
      logStream("debug", "API calling", "Update User");
      const { uuid } = req.params;
      const {
        username,
        password,
        givenName,
        familyName,
        gender,
        birthdate,
        addresses,
        role
      } = req.body;

        let roles;
        switch (role) {
          case "nurse":
            roles = JSON.parse(process.env.NURSE_ROLES);
            break;
          case "doctor":
            roles = JSON.parse(process.env.DOCTOR_ROLES);
            break;
  
          default:
            throw new Error("role not found");
        }

        const userPayload = {
          username,
          password,
          roles
        };
      await _updateUser(uuid, userPayload);
      logStream("debug", 'Updated the user', 'Update User');


      const userData = await _getUser(uuid);
      logStream("debug", 'Get the person', 'Update User');

      const personPayload = {
        givenName,
        familyName,
        gender,
        birthdate,
        addresses,
      };
      await _updatePerson(userData.person.uuid, personPayload);
      logStream("debug", 'Updated the Person', 'Update Person');

      res.json({
        message: "User updated successfully",
        status : true
      })
    } catch (error) {
      logStream("error", error.message);
      next(error);
    }
  };
  
  return this;
})();

const { default: axios } = require("axios");
const { links } = require("../models");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

module.exports = (function () {
  /**
   * Request otp for prescription
   */
  this.requestPresctionOtp = async (hash, phoneNumber) => {
    try {
      let link = await links.findOne({
        where: {
          hash,
        },
      });

      if (!link) {
        throw new Error("Invalid link!");
      }
      const otp = (
        await axios.get(
          `https://2factor.in/API/V1/${config.apiKey2Factor}/SMS/${phoneNumber}/AUTOGEN2`
        )
      ).data.OTP;

      return await link.update({ otp });
    } catch (error) {
      throw error;
    }
  };

  this.verfifyPresctionOtp = async (hash, otp) => {
    let link = await links.findOne({
      where: {
        hash,
      },
    });

    if (!link) {
      throw new Error("Invalid link!");
    }

    if (link.otp === otp) {
      return true;
    } else {
      throw new Error("Invalid OTP!");
    }
  };

  return this;
})();

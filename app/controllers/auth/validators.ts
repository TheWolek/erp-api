import joi from "joi";

export default {
  createAccount: joi.object({
    login: joi.string().required().messages({
      "string.empty": "Pole login jest wymagane",
    }),
    password: joi.string().required().min(8).messages({
      "string.empty": "Pole password jest wymagane",
      "string.min": "Hasło musi składać się z minimu 8 znaków",
    }),
    role: joi.string().required().messages({
      "string.empty": "Pole role jest wymagane",
    }),
  }),

  login: joi.object({
    login: joi.string().required().messages({
      "string.empty": "Pole login jest wymagane",
    }),
    password: joi.string().required().messages({
      "string.empty": "Pole password jest wymagane",
    }),
  }),
};

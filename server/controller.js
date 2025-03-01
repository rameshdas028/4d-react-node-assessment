"use strict";
import csvParser from "csv-parser";
import fs from "fs";
import readline from "readline";
import CustomeError from "./customError.js";
import Joi from 'joi';


export const uploadDocument = async (req, res, next) => {
  try {
    let response = {
      statusCode: 400,
      success: false,
      meesage: ''
    }
    if (!req.files || !req.files.file) {
      throw new CustomeError(400, 'File is required"')
    }
    const { file } = req.files;
    const { name, mimetype } = file;
    const validExtensions = ['text/csv', 'text/plain'];
    if (!validExtensions.includes(mimetype)) {
      throw new CustomeError(400, 'Only CSV and Txt file is allowed"')
    }
    const extractFileData = [];
    const mediaDir = "./medias";
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { mediaDir: true });
    }
    const timestamp = Date.now();
    const tempPath = `${mediaDir}/${timestamp}-${name}`;
    await file.mv(tempPath);
    if (mimetype == validExtensions[0]) {

      fs.createReadStream(tempPath)
        .pipe(csvParser())
        .on("data", (row) => extractFileData.push(row))
        .on("end", () => {
          response = {
            statusCode: 200,
            success: true,
            meesage: 'File Uploade suceesfully',
            result: extractFileData
          }
          return res.status(response.statusCode).json(response);
        });

    } else {
      const readStream = fs.createReadStream(tempPath);
      const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

      rl.on("line", (line) => {
        extractFileData.push(line.trim());
      });

      rl.on("close", () => {
        response = {
          statusCode: 200,
          success: true,
          meesage: 'Txt file is uploaded successfully',
          result: extractFileData
        };
        return res.status(response.statusCode).json(response);
      });

      rl.on("error", (error) => {
        console.error("Error reading file:", error);
        throw new CustomeError(400, error)
      });

    }
  } catch (error) {
    next(error)
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const validationRules = Joi.object({
      firstName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.empty': 'First Name is required.',
          'string.pattern.base': 'First Name must contain only letters.',
          'string.min': 'First Name must be at least 2 characters.',
          'string.max': 'First Name cannot exceed 50 characters.'
        }),


      lastName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.empty': 'Last Name is required.',
          'string.pattern.base': 'Last Name must contain only letters.',
          'string.min': 'Last Name must be at least 2 characters.',
          'string.max': 'Last Name cannot exceed 50 characters.'
        }),

      supervisorEmail: Joi.string()
        .email({ tlds: { allow: false } })
        .pattern(/@the4d\.ca$/)
        .required()
        .messages({
          'string.empty': 'Supervisor Email is required.',
          'string.email': 'Supervisor Email must be a valid email.',
          'string.pattern.base': 'Supervisor Email must be in the @the4d.ca domain.'
        }),

      employeeId: Joi.string()
        .pattern(/^ABC-\d{5}$/)
        .required()
        .messages({
          'string.empty': 'Employee ID is required.',
          'string.pattern.base': 'Employee ID must follow the format ABC-12345.'
        }),

      phoneNumber: Joi.string()
        .pattern(/^\+1 \(\d{3}\) \d{3}-\d{4}$/)
        .required()
        .messages({
          'string.empty': 'Phone Number is required.',
          'string.pattern.base': 'Phone Number must follow the format +1 (555) 555-5555.'
        }),

      salary: Joi.number()
        .positive()
        .required()
        .messages({
          'number.base': 'Annual Salary must be a number.',
          'number.positive': 'Annual Salary must be a positive value.',
          'any.required': 'Annual Salary is required.'
        }),

      startDate: Joi.date()
        .required()
        .messages({
          'date.base': 'Start Date must be a valid date.',
          'any.required': 'Start Date is required.'
        }),

      costCenter: Joi.string()
        .pattern(/^[A-Z]{2}-\d{3}-[A-Z]{3}$/)
        .required()
        .messages({
          'string.empty': 'Cost Center is required.',
          'string.pattern.base': 'Cost Center must follow the format AB-123-ABC.'
        }),

      projectCode: Joi.string()
        .pattern(/^PRJ-\d{4}-\d{3}$/)
        .required()
        .messages({
          'string.empty': 'Project Code is required.',
          'string.pattern.base': 'Project Code must follow the format PRJ-YEAR-001.'
        })
    });
    const { error } = validationRules.validate(req.body, { abortEarly: false });
    if (error) {
      throw new CustomeError(422, error.details[0].message)
    }
    const response = {
      statusCode: 200,
      success: true,
      meesage: 'form data is succfully validate.',
    };
    return res.status(response.statusCode).json(response);

  } catch (error) {
    next(error)

  }

}
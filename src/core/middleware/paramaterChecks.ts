import { NextFunction, Request, Response } from 'express';
import { validationFunctions } from '../utilities';

// Middleware to check if required params exist in req.body as strings
// Usage: validateBodyParamStrings["param1", "param2"]
export const validateBodyParamStrings = (requiredParams :string[]) => {
  return (req :Request, res :Response, next :NextFunction) => {
    const missingParams = [];

    requiredParams.forEach(param => {
      if (!validationFunctions.isStringProvided(req.body[param])) {
        missingParams.push(param);
      }
    });

    if (missingParams.length > 0) {
      const message = `Missing required information - ${missingParams.join(' + ')}`;
      return res.status(400).json({ message });
    }

    next();
  };
};


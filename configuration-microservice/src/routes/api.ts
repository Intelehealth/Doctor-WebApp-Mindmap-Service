import { Router } from 'express';
import jetValidator from 'jet-validator';

import adminMw from './middleware/adminMw';
import Paths from '../constants/Paths';
import User from '@src/models/User';
import AuthRoutes from './AuthRoutes';
import UserRoutes from './UserRoutes';
import SpecializationRoutes from './SpecializationRoutes';
import ConfigRoutes from './ConfigRoutes';
import LanguageRoutes from './LanguageRoutes';
import PatientRegistrationRoutes from './PatientRegistrationRoutes';
import authMw from './middleware/authMw';


// **** Variables **** //

const apiRouter = Router(),
  validate = jetValidator();


// **** Setup AuthRouter **** //

const authRouter = Router();

// Login user
authRouter.post(
  Paths.Auth.Login,
  validate('email', 'password'),
  AuthRoutes.login,
);

// Logout user
authRouter.get(
  Paths.Auth.Logout,
  AuthRoutes.logout,
);

// Add AuthRouter
// apiRouter.use(Paths.Auth.Base, authRouter);


// ** Add UserRouter ** //

const userRouter = Router();

// Get all users
userRouter.get(
  Paths.Users.Get,
  UserRoutes.getAll,
);

// Add one user
userRouter.post(
  Paths.Users.Add,
  validate(['user', User.isUser]),
  UserRoutes.add,
);

// Update one user
userRouter.put(
  Paths.Users.Update,
  validate(['user', User.isUser]),
  UserRoutes.update,
);

// Delete one user
userRouter.delete(
  Paths.Users.Delete,
  validate(['id', 'number', 'params']),
  UserRoutes.delete,
);

// Add UserRouter
// apiRouter.use(Paths.Users.Base, adminMw, userRouter);


// **** Setup SpecializationRouter **** //

const specializationRouter = Router();

// Get all specializations
specializationRouter.get(
  Paths.Specializations.Get,
  SpecializationRoutes.getAll,
);

// Update one specialization status
specializationRouter.put(
  Paths.Specializations.UpdateIsEnabled,
  validate(['id', 'number', 'params'],['is_enabled', 'boolean', 'body']),
  SpecializationRoutes.updateIsEnabled,
);

// Add SpecializationRouter
apiRouter.use(Paths.Specializations.Base, authMw, specializationRouter);

// **** Setup ConfigRouter **** //

const configRouter = Router();

// Get config
configRouter.get(
  Paths.Config.Get,
  ConfigRoutes.getConfig,
);

// Get published config
configRouter.get(
  Paths.Config.GetPublished,
  ConfigRoutes.getPublishedConfig,
);

// Publish configuration
configRouter.post(
  Paths.Config.Publish,
  authMw,
  ConfigRoutes.publish,
);

// Add ConfigRouter
apiRouter.use(Paths.Config.Base, configRouter);

// **** Setup LanguageRouter **** //

const languageRouter = Router();

// Get all languages
languageRouter.get(
  Paths.Languages.Get,
  LanguageRoutes.getAll,
);

// Update language status
languageRouter.put(
  Paths.Languages.UpdateIsEnabled,
  validate(['id', 'number', 'params'],['is_enabled', 'boolean', 'body']),
  LanguageRoutes.updateIsEnabled,
);

// Set as default language
languageRouter.put(
  Paths.Languages.Default,
  validate(['id', 'number', 'params']),
  LanguageRoutes.setDefault,
);

// Add LanguageRouter
apiRouter.use(Paths.Languages.Base, authMw, languageRouter);


// **** Setup PatientRegistrationRouter **** //

const patientRegistrationRouter = Router();

// Get all patient registration fields
patientRegistrationRouter.get(
  Paths.PatientResgistration.Get,
  PatientRegistrationRoutes.getAll,
);

// Update patient registration field enabled status
patientRegistrationRouter.put(
  Paths.PatientResgistration.UpdateIsEnabled,
  validate(['id', 'number', 'params'],['is_enabled', 'boolean', 'body']),
  PatientRegistrationRoutes.updateIsEnabled,
);

// Update patient registration field mandatory status
patientRegistrationRouter.put(
  Paths.PatientResgistration.updateIsMandatory,
  validate(['id', 'number', 'params'],['is_mandatory', 'boolean', 'body']),
  PatientRegistrationRoutes.updateIsMandatory,
);

// Update patient registration field editable status
patientRegistrationRouter.put(
  Paths.PatientResgistration.updateIsEditable,
  validate(['id', 'number', 'params'],['is_editable', 'boolean', 'body']),
  PatientRegistrationRoutes.updateIsEditable,
);


// Add LanguageRouter
apiRouter.use(Paths.PatientResgistration.Base, authMw, patientRegistrationRouter);

// **** Export default **** //

export default apiRouter;

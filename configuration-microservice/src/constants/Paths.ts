/**
 * Express router paths go here.
 */


export default {
  Base: '/api',
  Auth: {
    Base: '/auth',
    Login: '/login',
    Logout: '/logout',
  },
  Users: {
    Base: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
  Specializations: {
    Base: '/specialization',
    Get: '/all',
    UpdateIsEnabled: '/updateIsEnabled/:id',
  },
  Languages: {
    Base: '/language',
    Get: '/all',
    Default: '/default/:id',
    UpdateIsEnabled: '/updateIsEnabled/:id',
  },
  PatientResgistration: {
    Base: '/pr',
    Get: '/all',
    updateIsMandatory: '/updateIsMandatory/:id',
    updateIsEditable: '/updateIsEditable/:id',
    UpdateIsEnabled: '/updateIsEnabled/:id',
  },
  Config: {
    Base: '/config',
    Get: '/getApplicationConfig',
    GetPublished: '/getPublishedConfig',
    Publish: '/publish',
  },
  ThemeConfig: {
    Base: '/theme_config',
    Get: '/all',
    uploadImage: '/uploadImage',
    updateThemeConfig: '/updateThemeConfig',
    updateImagesText: '/updateImagesText',
    deleteImage: '/deleteImage'
  }
} as const;

// permissions.js
export const ACTIONS = {
    VIEW_PROFILE: 'VIEW_PROFILE',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
    DELETE_PROFILE: 'DELETE_PROFILE',
    VIEW_CAREGIVER: 'VIEW_CAREGIVER',
    VIEW_PACILLIAN_MEDICAL_HISTORY: 'VIEW_PACILLIAN_MEDICAL_HISTORY'
  };
  
  // Check if a user has permission for a specific action and resource
  export const hasPermission = (user, action, resourceId = null) => {
    if (!user) return false;
    
    const isCareGiver = user.roles && user.roles.includes('ROLE_CAREGIVER');
    const isPacillian = user.roles && user.roles.includes('ROLE_PACILLIAN');
    
    // Check based on user type and action
    if (isCareGiver) {
      switch (action) {
        case ACTIONS.VIEW_PROFILE:
          return true; // CareGivers can view any profile
        case ACTIONS.UPDATE_PROFILE:
        case ACTIONS.DELETE_PROFILE:
          return !resourceId || user.id === resourceId; // Only their own profile
        case ACTIONS.VIEW_PACILLIAN_MEDICAL_HISTORY:
          return true;
        default:
          return false;
      }
    } else if (isPacillian) {
      switch (action) {
        case ACTIONS.VIEW_PROFILE:
          return !resourceId || user.id === resourceId;
        case ACTIONS.UPDATE_PROFILE:
        case ACTIONS.DELETE_PROFILE:
          return !resourceId || user.id === resourceId; // Only their own profile
        case ACTIONS.VIEW_CAREGIVER:
          return true;
        default:
          return false;
      }
    }
    
    return false;
  };
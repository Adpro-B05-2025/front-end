import { hasPermission } from '@/utils/permissions';
import { toast } from 'react-toastify';

/**
 * Higher-Order Function that wraps API calls with permission checks
 * 
 * @param {Function} apiCall - The API function to wrap
 * @param {String} action - The action to check permission for
 * @param {Function} getResourceId - Optional function to extract resource ID from args
 * @returns {Function} - Wrapped function that checks permissions before calling API
 */
export const withPermissionCheck = (apiCall, action, getResourceId = null) => {
  return async (...args) => {
    // Get user from localStorage
    const user = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user'))
      : null;
    
    if (!user) {
      toast.error('You must be logged in');
      return { 
        ok: false, 
        status: 401, 
        json: () => Promise.resolve({ message: 'Not authenticated' })
      };
    }
    
    // Get resource ID if function provided
    const resourceId = getResourceId ? getResourceId(...args) : null;
    
    // Check permission first
    if (!hasPermission(user, action, resourceId)) {
      console.log(`Permission denied for action: ${action}, resourceId: ${resourceId}`);
      toast.error('You do not have permission to perform this action');
      return { 
        ok: false, 
        status: 403, 
        json: () => Promise.resolve({ message: 'Not authorized' })
      };
    }
    
    // If allowed, proceed with API call
    console.log(`Permission granted for action: ${action}, proceeding with API call`);
    return apiCall(...args);
  };
};
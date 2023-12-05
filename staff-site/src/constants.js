/**
 *  A set of constants used in multiple places across the application.
 */
const CONSTANTS = {
  APP: {
    BUTTON: {
      HEIGHT: 24,
      WIDTH: 24,
    }
  },
  NOTIFICATION: {
    DEFAULT_NOTIFICATION_TIMEOUT: 10000,
    DEFAULT_ERROR_NOTIFICATION_TIMEOUT: 15000, // Error notifications linger longer
    TYPES: { // Full list here https://6-4-0--reactstrap.netlify.app/components/alerts/
      LIGHT_BLUE: 'info',
      RED: 'danger',
      GREEN: 'success',
      YELLOW: 'warning',
    }
  },
  LOCAL_STORAGE: {
    USER: 'summit_user'
  }
}

export default CONSTANTS;
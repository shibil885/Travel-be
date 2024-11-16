export enum ErrorMessages {
  // Authentication and Authorization
  UNAUTHORIZED_ACCESS = 'Unauthorized access',
  INVALID_CREDENTIALS = 'Invalid credentials provided',
  TOKEN_EXPIRED = 'Authentication token has expired',

  // Booking Errors
  BOOKING_NOT_FOUND = 'Booking not found',
  BOOKING_CANCEL_UNAUTHORIZED = 'User role not authorized to cancel booking',
  BOOKING_CANCELLATION_FAILED = 'Failed to cancel booking',

  // Wallet Errors
  WALLET_NOT_FOUND = 'User wallet not found',
  WALLET_CREATION_FAILED = 'Could not create user wallet',
  WALLET_UPDATE_FAILED = 'Failed to update wallet balance',

  // Package Errors
  PACKAGE_NOT_FOUND = 'Package not found',
  PACKAGE_UPDATE_FAILED = 'Failed to update package details',

  // General Database Errors
  DATABASE_CONNECTION_FAILED = 'Failed to connect to the database',
  DATABASE_OPERATION_FAILED = 'Database operation failed',

  // Validation Errors
  INVALID_INPUT = 'Invalid input data',
  MISSING_REQUIRED_FIELDS = 'Missing required fields',
  INVALID_DATE_RANGE = 'End date must be after the start date',

  // General Errors
  UNKNOWN_ERROR = 'An unknown error occurred. Please try again later',
  BAD_REQUEST = 'Invalid request',
  NOT_FOUND = 'Requested resource not found',
  INTERNAL_SERVER_ERROR = 'Internal server error',

  //password Errors
  PASSWORD_NOT_MATCH = "Password don't match",
  CONFIRM_PASSWOR_NOT_MATCH = "Confirm Password don't match",

  //
  SOMETHING_WENT_WRONG = 'Somthing went wrong',
}

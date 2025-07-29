export enum AuthErrorMessages {
  INVALID_CREDENTIALS = 'Invalid email or password',
  USER_NOT_FOUND = 'User not found',
  EMAIL_ALREADY_EXISTS = 'Email already exists',
  ACCOUNT_SUSPENDED = 'Your account has been suspended',
  ACCOUNT_NOT_VERIFIED = 'Please verify your email address',
  TOKEN_EXPIRED = 'Session expired. Please login again',
  TOKEN_INVALID = 'Invalid authentication token',
  UNAUTHORIZED_ACCESS = 'Unauthorized access',
  PASSWORD_RESET_TOKEN_INVALID = 'Invalid or expired password reset token',
  OLD_PASSWORD_INCORRECT = 'Current password is incorrect',
  WEAK_PASSWORD = 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  LOGIN_ATTEMPTS_EXCEEDED = 'Too many login attempts. Please try again later',
}

export enum UserErrorMessages {
  USER_NOT_FOUND = 'User not found',
  USER_ALREADY_EXISTS = 'User already exists',
  INVALID_USER_DATA = 'Invalid user data provided',
  USER_CREATION_FAILED = 'Failed to create user',
  USER_UPDATE_FAILED = 'Failed to update user',
  USER_DELETE_FAILED = 'Failed to delete user',
  PROFILE_PICTURE_UPLOAD_FAILED = 'Failed to upload profile picture',
  INVALID_FILE_FORMAT = 'Invalid file format. Only JPG, PNG allowed',
  FILE_SIZE_EXCEEDED = 'File size exceeded. Maximum 5MB allowed',
}

export enum AgencyErrorMessages {
  AGENCY_NOT_FOUND = 'Agency not found',
  AGENCY_ALREADY_EXISTS = 'Agency already exists with this email',
  AGENCY_NOT_VERIFIED = 'Agency is not verified',
  AGENCY_NOT_APPROVED = 'Agency is not approved by admin',
  AGENCY_SUSPENDED = 'Agency account is suspended',
  INVALID_AGENCY_DATA = 'Invalid agency data provided',
  DOCUMENT_UPLOAD_FAILED = 'Failed to upload documents',
  AGENCY_REGISTRATION_FAILED = 'Agency registration failed',
  INSUFFICIENT_PERMISSIONS = 'Insufficient permissions to perform this action',
  AGENCY_LIMIT_EXCEEDED = 'Maximum number of agencies reached',
}

export enum PackageErrorMessages {
  PACKAGE_NOT_FOUND = 'Package not found',
  PACKAGE_NOT_AVAILABLE = 'Package is not available',
  PACKAGE_EXPIRED = 'Package has expired',
  INVALID_PACKAGE_DATA = 'Invalid package data provided',
  PACKAGE_CREATION_FAILED = 'Failed to create package',
  PACKAGE_UPDATE_FAILED = 'Failed to update package',
  PACKAGE_DELETE_FAILED = 'Failed to delete package',
  IMAGE_UPLOAD_FAILED = 'Failed to upload package images',
  PRICE_INVALID = 'Invalid price format',
  DATE_INVALID = 'Invalid date range provided',
  CAPACITY_EXCEEDED = 'Package capacity exceeded',
  PACKAGE_INACTIVE = 'Package is currently inactive',
}

export enum BookingErrorMessages {
  BOOKING_NOT_FOUND = 'Booking not found',
  BOOKING_ALREADY_EXISTS = 'Booking already exists for this package',
  INVALID_BOOKING_DATA = 'Invalid booking data provided',
  BOOKING_CREATION_FAILED = 'Failed to create booking',
  BOOKING_UPDATE_FAILED = 'Failed to update booking',
  BOOKING_CANCELLATION_FAILED = 'Failed to cancel booking',
  BOOKING_CONFIRMED_CANNOT_CANCEL = 'Cannot cancel confirmed booking',
  INSUFFICIENT_CAPACITY = 'Insufficient package capacity available',
  BOOKING_DATE_PAST = 'Cannot book for past dates',
  CANCELLATION_DEADLINE_PASSED = 'Cancellation deadline has passed',
  BOOKING_ALREADY_CANCELLED = 'Booking is already cancelled',
}

export enum PaymentErrorMessages {
  PAYMENT_FAILED = 'Payment processing failed',
  PAYMENT_VERIFICATION_FAILED = 'Payment verification failed',
  INSUFFICIENT_WALLET_BALANCE = 'Insufficient wallet balance',
  INVALID_PAYMENT_METHOD = 'Invalid payment method',
  PAYMENT_AMOUNT_MISMATCH = 'Payment amount mismatch',
  RAZORPAY_ERROR = 'Payment gateway error occurred',
  REFUND_FAILED = 'Refund processing failed',
  REFUND_NOT_ELIGIBLE = 'Not eligible for refund',
  WALLET_TRANSACTION_FAILED = 'Wallet transaction failed',
  PAYMENT_TIMEOUT = 'Payment request timed out',
  DUPLICATE_PAYMENT = 'Duplicate payment detected',
}

export enum ChatErrorMessages {
  MESSAGE_SEND_FAILED = 'Failed to send message',
  CHAT_NOT_FOUND = 'Chat not found',
  UNAUTHORIZED_CHAT_ACCESS = 'Unauthorized access to chat',
  FILE_UPLOAD_FAILED = 'Failed to upload file',
  INVALID_FILE_TYPE = 'Invalid file type for chat',
  MESSAGE_TOO_LONG = 'Message exceeds maximum length',
  CHAT_CREATION_FAILED = 'Failed to create chat',
  USER_NOT_IN_CHAT = 'User is not part of this chat',
  CHAT_ALREADY_EXISTS = 'Chat already exists between these users',
  MESSAGE_DELETE_FAILED = 'Failed to delete message',
}

export enum ReportErrorMessages {
  REPORT_NOT_FOUND = 'Report not found',
  REPORT_ALREADY_EXISTS = 'You have already reported this item',
  INVALID_REPORT_DATA = 'Invalid report data provided',
  REPORT_SUBMISSION_FAILED = 'Failed to submit report',
  REPORT_UPDATE_FAILED = 'Failed to update report',
  CANNOT_REPORT_OWN_CONTENT = 'Cannot report your own content',
  REPORT_ALREADY_RESOLVED = 'Report is already resolved',
  INSUFFICIENT_REPORT_PERMISSIONS = 'Insufficient permissions to handle reports',
}

export enum AdminErrorMessages {
  ADMIN_ACCESS_DENIED = 'Admin access denied',
  ADMIN_NOT_FOUND = 'Admin not found',
  INVALID_ADMIN_ACTION = 'Invalid admin action',
  SYSTEM_MAINTENANCE_MODE = 'System is under maintenance',
  BULK_ACTION_FAILED = 'Bulk action failed',
  BACKUP_CREATION_FAILED = 'Failed to create system backup',
  SETTINGS_UPDATE_FAILED = 'Failed to update system settings',
  DASHBOARD_LOAD_FAILED = 'Failed to load admin dashboard',
}

export enum GeneralErrorMessages {
  INTERNAL_SERVER_ERROR = 'Internal server error occurred',
  SERVICE_UNAVAILABLE = 'Service temporarily unavailable',
  NETWORK_ERROR = 'Network connection error',
  INVALID_REQUEST = 'Invalid request format',
  RATE_LIMIT_EXCEEDED = 'Too many requests. Please try again later',
  MAINTENANCE_MODE = 'System is under maintenance',
  FEATURE_NOT_AVAILABLE = 'This feature is currently not available',
  DATA_VALIDATION_ERROR = 'Data validation failed',
  DATABASE_CONNECTION_ERROR = 'Database connection error',
  THIRD_PARTY_SERVICE_ERROR = 'Third-party service error',
}

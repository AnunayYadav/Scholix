/**
 * iOS & Apple-grade Silky Smooth Animation & Spring Physics Specs
 * Calibrated against iOS 17/18 Human Interface Guidelines:
 * - Fluid spring deceleration curve: cubic-bezier(0.32, 0.72, 0, 1)
 * - Modal bounce damping & stiffness tuned for natural physical feedback
 * - Low latency touch scale & rubber-band recovery
 */

// Framer Motion Spring Presets
export const IOS_TRANSITION = {
  // Apple standard modal / dialog spring
  modalSpring: {
    type: "spring" as const,
    damping: 30,
    stiffness: 340,
    mass: 0.82,
  },
  // Apple Action Sheet / Bottom Sheet fluid spring
  sheetSpring: {
    type: "spring" as const,
    damping: 32,
    stiffness: 310,
    mass: 0.88,
  },
  // Fluid ease curve (equivalent to iOS cubic-bezier(0.32, 0.72, 0, 1))
  fluid: {
    duration: 0.38,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  // Quick iOS exit curve (clean, snappy dismissal)
  exit: {
    duration: 0.22,
    ease: [0.32, 0, 0.67, 0] as const,
  },
  // Apple frosted backdrop fade
  backdrop: {
    duration: 0.32,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  backdropExit: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1] as const,
  },
  // Dynamic Island / Banner toast spring
  toastSpring: {
    type: "spring" as const,
    damping: 26,
    stiffness: 380,
    mass: 0.75,
  },
};

// Modal Card Variants (iOS Alert & Center Dialogs)
export const iosModalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.93,
    y: 14,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: IOS_TRANSITION.modalSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    filter: "blur(2px)",
    transition: IOS_TRANSITION.exit,
  },
};

// Backdrop / Scrim Variants (iOS Frosted Glass)
export const iosBackdropVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(24px) saturate(190%)",
    WebkitBackdropFilter: "blur(24px) saturate(190%)",
    transition: IOS_TRANSITION.backdrop,
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
    transition: IOS_TRANSITION.backdropExit,
  },
};

// Bottom Sheet Variants (iOS Action Sheet & Mobile Trays)
export const iosSheetVariants = {
  hidden: {
    opacity: 0.6,
    y: "100%",
  },
  visible: {
    opacity: 1,
    y: "0%",
    transition: IOS_TRANSITION.sheetSpring,
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: IOS_TRANSITION.exit,
  },
};

// Card / Item Cascade Reveal Variants
export const iosItemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: IOS_TRANSITION.fluid,
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.98,
    transition: IOS_TRANSITION.exit,
  },
};

// Toast / Notification Banner Variants (Dynamic Island feel)
export const iosToastVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.92,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: IOS_TRANSITION.toastSpring,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    filter: "blur(2px)",
    transition: IOS_TRANSITION.exit,
  },
};

import { GroupingVisual, RbacVisual, IntegrationVisual } from "./FeatureVisuals";
import { IconGrouping, IconRbac, IconIntegration } from "./FeatureIcons";

export const FEATURES = [
  {
    number: "01",
    title: "Fingerprint grouping",
    description:
      "Each inbound error is hashed by message + top stack frame. Duplicates collapse into one issue with an incrementing counter — not 847 separate alerts.",
    Visual: GroupingVisual,
    Icon: IconGrouping,
  },
  {
    number: "02",
    title: "Role-based team access",
    description:
      "Invite as Owner, Admin, Member, or Viewer. Permissions are checked server-side on every mutation — the client is never trusted.",
    Visual: RbacVisual,
    Icon: IconRbac,
  },
  {
    number: "03",
    title: "Zero-SDK integration",
    description:
      "A single POST request with your project API key. No library to install, no agent to run — works from any language, any CI step, any runtime.",
    Visual: IntegrationVisual,
    Icon: IconIntegration,
  },
] as const;

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@gymflow/design-tokens",
    "@gymflow/domain-types",
    "@gymflow/validation",
  ],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

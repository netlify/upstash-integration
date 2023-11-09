import { NetlifyIntegrationUI } from "@netlify/sdk";

import integrateDatabase from "./routes/integrateDatabase";
import root from "./routes/root";

const integrationUI = new NetlifyIntegrationUI("integration-upstash-sdk");

const surface = integrationUI.addSurface("integrations-settings");

surface.registerRoute(integrateDatabase);
surface.registerRoute(root);

export { integrationUI };

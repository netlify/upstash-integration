import { SurfaceRoute, UIElementInputSelectOptions } from "@netlify/sdk";
import { Status, UpstashRedisDatabase } from "../..";

const route = new SurfaceRoute("/");

route.onLoad(async (state) => {
  const { fetch, picker } = state;

  const statusResponse = await fetch("status");

  const status = (await statusResponse.json()) as Status;

  if (!status.connected) {
    const connectForm = picker.getElementById("connect-form");
    if (connectForm) {
      connectForm.display = "visible";
    }
  } else {
    const databases = status.databases;

    const databasePicker =
      picker.getElementById<UIElementInputSelectOptions>("upstash_database");

    if (databasePicker) {
      databasePicker.options = databases?.map((database) => ({
        label: database.name,
        value: database.id,
      }));
    }

    const integrateCard = picker.getElementById("integratate-card");

    if (integrateCard) {
      integrateCard.display = "visible";
    }
  }
});

route.addSection(
  {
    id: "intro-section",
    title: "Upstash",
    description: "Easily configure your Upstash account",
  },
  (section) => {
    section.addForm(
      {
        display: "hidden",
        id: "connect-form",
        title: "Configure Upstash",
        savingLabel: "Connecting",
        saveLabel: "Connect",
        onSubmit: async (state) => {
          const { fetch, picker, integrationNavigation } = state;

          const apiKey = picker.getFormInputValue(
            "connect-form",
            "upstash_api_key",
          );
          const email = picker.getFormInputValue(
            "connect-form",
            "upstash_email",
          );

          if (!apiKey || !email) {
            return;
          }

          const response = await fetch("connect", {
            method: "POST",
            body: JSON.stringify({
              apiKey,
              email,
            }),
          });

          if (response.status === 200) {
            integrationNavigation.navigateTo("/integrate-database");
          }
        },
      },
      (form) => {
        form.addInputPassword({
          id: "upstash_api_key",
          label: "Upstash API Key",
        });
        form.addInputText({
          id: "upstash_email",
          label: "Upstash Email",
        });
      },
    );
    section.addCard(
      {
        id: "use-integration-card",
        title: "Use your Upstash integration",
        display: "hidden",
      },
      (card) => {
        card.addInputSelect({
          id: "upstash_database",
          label: "Upstash Database",
          callback: () => {
            alert("show snippet!");
          },
        });
      },
    );
  },
);

export default route;

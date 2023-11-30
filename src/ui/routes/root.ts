import {
  SurfaceRoute,
  UIElementAlertOptions,
  UIElementCodeSnippetOptions,
  UIElementInputSelectOptions,
  UIElementInputTextOptions,
} from "@netlify/sdk";
import { Status, UpstashRedisDatabase } from "../..";
import { generateCodeSnippet, getEnvVarName } from "../../utils";

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
      picker.getElementById<UIElementInputSelectOptions>("upstash-database");

    if (databasePicker) {
      databasePicker.options = databases?.map((database) => ({
        label: database.name,
        value: database.id,
      }));
    }

    const integrateCard = picker.getElementById("use-integration-card");
    if (integrateCard) {
      integrateCard.display = "visible";
    }

    if (databases?.length) {
      const dropdown = picker.getElementById("upstash-database");
      if (dropdown) {
        dropdown.display = "visible";
      }
    } else {
      const databaseDescription =
        picker.getElementById<UIElementInputTextOptions>(
          "upstash-database-description",
        );

      if (databaseDescription) {
        databaseDescription.value =
          "Integrate your first database and we will create your environment variables for you.";
      }
    }
  }

  if (status.error) {
    const errorCard =
      picker.getElementById<UIElementAlertOptions>("error-card");
    if (errorCard) {
      errorCard.display = "visible";
      if (status.error === "Unauthorized") {
        errorCard.text =
          "You entered an invalid API key or email when connecting to Upstash. Please try again.";
      }
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
    section.addAlert({
      id: "error-card",
      display: "hidden",
      level: "error",
      text: "",
    });
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
            "upstash-api-key",
          );
          const email = picker.getFormInputValue(
            "connect-form",
            "upstash-email",
          );

          if (!apiKey || !email) {
            return;
          }

          const connectResponse = await fetch("connect", {
            method: "POST",
            body: JSON.stringify({
              apiKey,
              email,
            }),
          });

          if (connectResponse.ok) {
            const statusResponse = await fetch("status");

            const status = (await statusResponse.json()) as Status;
            const errorCard =
              picker.getElementById<UIElementAlertOptions>("error-card");

            if (status.error) {
              if (errorCard) {
                errorCard.display = "visible";
                if (status.error === "Unauthorized") {
                  errorCard.text = "Invalid API key or email";
                }
              }
            } else {
              if (!status.connected) {
                if (errorCard) {
                  errorCard.display = "visible";
                  errorCard.text = "Something went wrong";
                }
              } else {
                integrationNavigation.navigateTo("/");
              }
            }
          }
        },
      },
      (form) => {
        form.addText({
          value:
            "You can find your Upstash API key in your [account settings](https://console.upstash.com/account/api)",
        });
        form.addInputPassword({
          id: "upstash-api-key",
          label: "Upstash API Key",
        });
        form.addInputText({
          id: "upstash-email",
          label: "Upstash Email",
        });
      },
    );
    section.addCard(
      {
        id: "use-integration-card",
        title: "Your integrated databases",
        display: "hidden",
      },
      (card) => {
        card.addText({
          id: "upstash-database-description",
          value:
            "Select a database and view a code snippet that will help you connect to it using a Netlify edge function and the environment variables have created for you.",
        });
        card.addInputSelect({
          id: "upstash-database",
          display: "hidden",
          label: "Select a database",
          callback: async (state, value) => {
            const { picker, fetch } = state;

            const getDatabasesResponse = await fetch("get-databases");

            const databases =
              (await getDatabasesResponse.json()) as UpstashRedisDatabase[];

            const database = databases.find(
              (database) => database.database_id === value,
            );

            if (!database) {
              throw new Error("Database not found");
            }

            const redisDBUrlEnvVarName = getEnvVarName(
              database.database_name,
              "URL",
            );
            const redisDBTokenEnvVarName = getEnvVarName(
              database.database_name,
              "TOKEN",
            );

            const snippetElement =
              picker.getElementById<UIElementCodeSnippetOptions>(
                "upstash-snippet",
              );

            if (snippetElement) {
              snippetElement.code = generateCodeSnippet(
                redisDBUrlEnvVarName,
                redisDBTokenEnvVarName,
              );
              snippetElement.display = "visible";
            }
          },
        });
        card.addCodeSnippet({
          language: "js",
          display: "hidden",
          id: "upstash-snippet",
          code: "",
        });

        card.addButton({
          title: "Integrate database",
          id: "add-database-button",
          callback: (state) => {
            const { integrationNavigation } = state;
            integrationNavigation.navigateTo("/integrate-database");
          },
        });
      },
    );
  },
);

route.addDisableIntegrationSection({
  integrationName: "Upstash",
});

export default route;

import { SurfaceRoute, UIElementInputSelectOptions } from "@netlify/sdk";
import { UpstashRedisDatabase } from "../../index";

const route = new SurfaceRoute("/integrate-database");

route.onLoad(async (state) => {
  const { fetch, picker } = state;

  const databasesResponse = await fetch("get-databases");

  const databases = (await databasesResponse.json()) as UpstashRedisDatabase[];

  const databasePicker = picker.getFormElementById<UIElementInputSelectOptions>(
    "integrate-form",
    "upstash-database",
  );

  if (databasePicker) {
    databasePicker.options = databases.map((database) => ({
      label: database.database_name,
      value: database.database_id,
    }));
  }
});

route.addSection(
  {
    id: "integratate-section",
    description: "",
    title: "Easily configure your Upstash account",
  },
  (section) => {
    section.addForm(
      {
        id: "integrate-form",
        title: "Select your Redis database",
        savingLabel: "Integrating",
        saveLabel: "Integrate",
        hideCancel: true,
        onSubmit: async (state) => {
          const { fetch, picker, integrationNavigation } = state;

          const databaseId = picker.getFormInputValue(
            "integrate-form",
            "upstash-database",
          );

          const databasesResponse = await fetch("get-databases");

          const databases =
            (await databasesResponse.json()) as UpstashRedisDatabase[];

          const database = databases.find(
            (database) => database.database_id === databaseId,
          );

          if (!database) {
            throw new Error("Database not found");
          }

          const integrateResponse = await fetch("integrate", {
            method: "POST",
            body: JSON.stringify({
              databaseId,
              databaseName: database.database_name,
            }),
          });

          if (integrateResponse.status === 200) {
            integrationNavigation.navigateTo("/");
          } else {
            throw new Error("Something went wrong");
          }
        },
      },
      (card) => {
        card.addInputSelect({
          id: "upstash-database",
          label: "Upstash Database",
        });
      },
    );
  },
);

export default route;

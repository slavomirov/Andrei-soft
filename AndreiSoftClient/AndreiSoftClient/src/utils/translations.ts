// Bulgarian translations for enum values displayed in the UI

const statusMap: Record<string, string> = {
  Added: "Добавена",
  WorkingOn: "В обработка",
  Completed: "Завършена",
  GivenToClient: "Предадена на клиент",
};

const actionMap: Record<string, string> = {
  Created: "Създадена",
  Updated: "Актуализирана",
  StartedWork: "Започната работа",
  Finished: "Завършена",
  ServiceNeedAdded: "Добавена услуга",
  ServiceNeedRemoved: "Премахната услуга",
  ServiceNeedChecked: "Отбелязана услуга",
};

export function translateStatus(status: string): string {
  return statusMap[status] ?? status;
}

export function translateAction(action: string): string {
  return actionMap[action] ?? action;
}

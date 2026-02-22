import * as signalR from "@microsoft/signalr";

const HUB_URL = "https://localhost:7029/hubs/heads";

export function createHeadsHubConnection(token: string) {
  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();
}

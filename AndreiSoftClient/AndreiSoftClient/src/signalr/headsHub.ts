import * as signalR from "@microsoft/signalr";

const hubUrl = "https://localhost:5001/hubs/heads"; // промени към твоя бекенд

export function createHeadsHubConnection(token: string) {
  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token
    })
    .withAutomaticReconnect()
    .build();
}

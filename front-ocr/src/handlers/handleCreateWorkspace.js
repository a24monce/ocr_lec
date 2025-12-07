// handlers/handleworkspace.js
import { createWorkspace } from "../lib/workspace";

export async function handleCreateWorkspace(
  workspaceData,
  setWorkspaces,
  setActiveId,
  setCurrentWorkspace,
  setShowSearch
) {
  const newWs = await createWorkspace(workspaceData);
  setWorkspaces((prev) => [newWs, ...prev]);
  setActiveId(newWs.id);
  setCurrentWorkspace(newWs);
  setShowSearch(false);
}

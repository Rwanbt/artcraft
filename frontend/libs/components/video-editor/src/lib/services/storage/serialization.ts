import type { MediaAsset } from "../../media/types";
import type { TProject } from "../../project/types";
import type { AudioTrack, TScene } from "../../timeline/types";
import type {
  MediaAssetData,
  SerializedProject,
  SerializedScene,
} from "./types";

// JSON document shape persisted by ProjectStorageAdapter implementations.
// TProject only references media by `mediaId`, so the document carries a
// manifest of the media bin alongside the project — enough for the editor
// to re-resolve every asset through MediaSourceAdapter on load.
export interface ProjectDocument {
  version: 1;
  project: SerializedProject;
  media: MediaAssetData[];
}

export function serializeProjectDocument({
  project,
  media,
}: {
  project: TProject;
  media: MediaAssetData[];
}): ProjectDocument {
  return {
    version: 1,
    project: {
      ...project,
      metadata: {
        ...project.metadata,
        createdAt: project.metadata.createdAt.toISOString(),
        updatedAt: project.metadata.updatedAt.toISOString(),
      },
      scenes: project.scenes.map(serializeScene),
    },
    media,
  };
}

// Accepts both the versioned document shape and legacy envelopes whose
// `data` was a raw TProject (IndexedDB rows structured-cloned before the
// document wrapper existed — their Date fields may still be real Dates).
export function deserializeProjectDocument(
  data: unknown,
): { project: TProject; media: MediaAssetData[] } | null {
  if (!data || typeof data !== "object") return null;

  if ("metadata" in data) {
    const project = reviveProject(data as SerializedProject);
    return project ? { project, media: [] } : null;
  }

  if ("project" in data) {
    const document = data as ProjectDocument;
    const project = document.project && reviveProject(document.project);
    const media = document.media ?? [];
    if (!project || !Array.isArray(media)) return null;
    return { project, media };
  }

  return null;
}

export function mediaAssetToData(asset: MediaAsset): MediaAssetData {
  // `thumbnailUrl` is deliberately dropped: runtime thumbnails are data:
  // or blob: URLs regenerated during rehydration, and embedding them
  // would bloat the persisted document.
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    size: asset.file?.size ?? 0,
    lastModified: asset.file?.lastModified ?? 0,
    width: asset.width,
    height: asset.height,
    duration: asset.duration,
    fps: asset.fps,
    hasAudio: asset.hasAudio,
    ephemeral: asset.ephemeral,
  };
}

function serializeScene(scene: TScene): SerializedScene {
  return {
    ...scene,
    tracks: {
      ...scene.tracks,
      audio: scene.tracks.audio.map(stripAudioBuffers),
    },
    createdAt: scene.createdAt.toISOString(),
    updatedAt: scene.updatedAt.toISOString(),
  };
}

// AudioElement.buffer holds a decoded AudioBuffer — a runtime cache that
// can't survive JSON (or structured clone). It's rebuilt from the media
// source after load.
function stripAudioBuffers(track: AudioTrack): AudioTrack {
  return {
    ...track,
    elements: track.elements.map((element) => {
      if (!element.buffer) return element;
      const { buffer: _buffer, ...rest } = element;
      return rest as typeof element;
    }),
  };
}

// Saved project data is untrusted: corrupt metadata or scene timestamps must
// not crash the editor when loading a persisted project.
function reviveProject(project: SerializedProject | TProject): TProject | null {
  if (!project?.metadata || !Array.isArray(project.scenes)) return null;

  const createdAt = toDate(project.metadata.createdAt);
  const updatedAt = toDate(project.metadata.updatedAt);
  if (!createdAt || !updatedAt) return null;

  const scenes: TScene[] = [];
  for (const scene of project.scenes) {
    if (!scene || typeof scene !== "object") return null;
    const sceneCreatedAt = toDate(scene.createdAt);
    const sceneUpdatedAt = toDate(scene.updatedAt);
    if (!sceneCreatedAt || !sceneUpdatedAt) return null;
    scenes.push({
      ...scene,
      createdAt: sceneCreatedAt,
      updatedAt: sceneUpdatedAt,
    });
  }

  return {
    ...project,
    metadata: { ...project.metadata, createdAt, updatedAt },
    scenes,
  };
}

function toDate(value: string | Date): Date | null {
  const parsed =
    value instanceof Date
      ? new Date(value.getTime())
      : typeof value === "string"
        ? new Date(value)
        : null;
  return parsed && Number.isFinite(parsed.getTime()) ? parsed : null;
}

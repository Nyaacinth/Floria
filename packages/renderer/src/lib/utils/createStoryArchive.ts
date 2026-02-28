export type StoryArchive = {
    inkScript: string
    images: {
        [imageName: string]: URL
    }
    audio: {
        [audioName: string]: URL
    }
}

export function createStoryArchive(
    inkScript: string,
    images: { [imageName: string]: URL },
    audio: { [audioName: string]: URL }
): StoryArchive {
    return {
        inkScript,
        images,
        audio
    }
}

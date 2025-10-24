// Declaration file for WebRTC extensions
// This adds proper typing support for the getDisplayMedia API

interface MediaDevices {
    /**
     * Prompts the user to select a display or portion of a display (such as a window) 
     * to capture as a MediaStream for sharing or recording purposes.
     * 
     * @param constraints - The media constraints for the stream to capture
     * @returns A promise that resolves to a MediaStream object containing the display's contents
     */
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
}
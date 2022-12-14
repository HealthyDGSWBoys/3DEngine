import { GpuBuffer, LandmarkList, NormalizedLandmarkList, Results } from "@mediapipe/pose"
import { Vector3 } from "three"

export default class PoseResult implements Results {
    public poseLandmarks: NormalizedLandmarkList
    public poseWorldLandmarks: LandmarkList
    public segmentationMask: GpuBuffer
    public image: GpuBuffer
    public duration: number

    public static UNDEFINED = "undefined"

    public static LEFT_ARM = "leftArm"
    public static RIGHT_ARM = "rightArm"
    public static LEFT_LEG = "leftLeg"
    public static RIGHT_LEG = "rightLeg"
    public static LEFT_HIP_Y = "leftHipY"
    public static RIGHT_HIP_Y = "rightHipX"
    public static LEFT_HIP_X = "leftHipY"
    public static RIGHT_HIP_X = "rightHipX"
    public static LEFT_SHOULDER_X = "leftShoulderX"
    public static RIGHT_SHOULDER_X = "rightShoulderX"
    public static LEFT_SHOULDER_Y = "leftShoulderY"
    public static RIGHT_SHOULDER_Y = "rightShoulderY"

    public static joints = new Map([
        [PoseResult.LEFT_ARM, [11, 13, 15]],
        [PoseResult.RIGHT_ARM, [12, 14, 16]],
        [PoseResult.LEFT_LEG, [23, 25, 27]],
        [PoseResult.RIGHT_LEG, [24, 26, 28]],
        [PoseResult.LEFT_HIP_Y, [25, 23, 24]],
        [PoseResult.RIGHT_HIP_Y, [26, 24, 23]],
        [PoseResult.LEFT_HIP_X, [11, 23, 25]],
        [PoseResult.RIGHT_HIP_X, [12, 24, 26]],
        [PoseResult.LEFT_SHOULDER_X, [13, 11, 23]],
        [PoseResult.RIGHT_SHOULDER_X, [14, 12, 24]],
        [PoseResult.LEFT_SHOULDER_Y, [13, 11, 12]],
        [PoseResult.RIGHT_SHOULDER_Y, [14, 12, 11]],
    ])

    constructor (
        result: Results,
        duration: number
    ) {
        this.poseLandmarks = result.poseLandmarks
        this.poseWorldLandmarks = result.poseWorldLandmarks
        this.segmentationMask = result.segmentationMask
        this.image = result.image
        this.duration = duration
    }
    public getJointAngle(jointName: string): JoinAngle {
        const jointInfo = PoseResult.joints.get(jointName)
        if(jointInfo === undefined) {
            return new JoinAngle(PoseResult.UNDEFINED, 0, 0)
        }
        else {
            try {
                const arr = [
                    this.poseWorldLandmarks.at(jointInfo[0])!,
                    this.poseWorldLandmarks.at(jointInfo[1])!,
                    this.poseWorldLandmarks.at(jointInfo[2])!
                ]
                return new JoinAngle(
                    jointName, 
                    PoseResult.ThreeDegree(arr[0], arr[1], arr[2]),
                    ((arr[0].visibility ?? 0) + (arr[1].visibility ?? 0) + (arr[2].visibility ?? 0)) / 3
                )
            }
            catch(e) {
                return new JoinAngle(
                    "Error", 
                    0,
                    0
                )
            }

        }
    }
    public static ThreeDegree(
        a: {x: number, y: number, z: number}, 
        b: {x: number, y: number, z: number}, 
        c: {x: number, y: number, z: number}
    ) {
        const ab = [b.x - a.x, b.y - a.y, b.z - a.z]
        const bc = [c.x - b.x, c.y - b.y, c.z - b.z]
        const abVec = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2]);
        const bcVec = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1] + bc[2] * bc[2]);
        const abNorm = [ab[0] / abVec, ab[1] / abVec, ab[2] / abVec]
        const bcNorm = [bc[0] / bcVec, bc[1] / bcVec, bc[2] / bcVec]
        const res = abNorm[0] * bcNorm[0] + abNorm[1] * bcNorm[1] + abNorm[2] * bcNorm[2];
        return Math.PI - Math.acos(res)
    }
}

export class JoinAngle {
    public name: string
    private radian: number
    public accuracy: number
    constructor (
        name: string,
        radian: number,
        accuracy: number
    ) {
        this.name = name
        this.radian = radian
        this.accuracy = accuracy
    }
    public getAngle(type?: "radian" | "degree"): number {
        if(type === "degree") { return this.radian * 180 / Math.PI }
        else { return this.radian }
    }
}
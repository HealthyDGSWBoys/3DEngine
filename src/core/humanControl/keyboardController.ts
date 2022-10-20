import { Euler } from "three"
import Human from "../../engine/human/human"
import Controller, { ControlInfo } from "./controller"

export default class KeyboardController extends Controller {
    constructor (
        human: Human
    ) {
        super(human)
    }
    public control: (code: number, value: any) => ControlInfo | undefined = (code: number, value: KeyboardEvent) => {
        if(value.code === "KeyW") {
            this.humanUpdatePosition(this.dirCalculator(2), 500)
        }
        else if(value.code === "KeyA") {
            this.humanUpdateRotation(new Euler(0, -0.5, 0), 300)
        }
        else if(value.code === "KeyD") {
            this.humanUpdateRotation(new Euler(0, 0.5, 0), 300)
        }
        return undefined
    }
}
import { BlochVector } from '@qbead/bloch-sphere';
import { Color, type ColorRepresentation } from 'three';

const serviceUuid = 'e30c1fc6-359c-12be-2544-63d6aa088d45';

const accUuid = 'e30c1fc9-359c-12be-2544-63d6aa088d45';
const sphUuid = 'e30c1fc8-359c-12be-2544-63d6aa088d45';
const colUuid = 'e30c1fc7-359c-12be-2544-63d6aa088d45';

interface ConstructorParams {
	handlers: any;
	sphCharacteristic: BluetoothRemoteGATTCharacteristic;
	colCharacteristic: BluetoothRemoteGATTCharacteristic;
	accCharacteristic: BluetoothRemoteGATTCharacteristic;
}

export default class QBead {
	#accel: BlochVector = $state(BlochVector.from(0, 0, -1));
	#sphereCoord?: BlochVector = $state();
	#color?: Color = $state();
	handlers: any = $state();

	#sphCharacteristic: BluetoothRemoteGATTCharacteristic;
	#colCharacteristic: BluetoothRemoteGATTCharacteristic;

	constructor({
		handlers,
		sphCharacteristic,
		colCharacteristic,
		accCharacteristic
	}: ConstructorParams) {
		this.handlers = handlers;
		this.#sphCharacteristic = sphCharacteristic;
		this.#colCharacteristic = colCharacteristic;

		accCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
			new Uint8Array(event.target.value.buffer).reverse();
			let value = event.target.value;
			this.#accel = BlochVector.from(value.getFloat32(0), value.getFloat32(4), value.getFloat32(8));
			this.handlers?.onAccelUpdate();
		});
	}

	static async connect(handlers: any) {
		// TODO put the connection logs in the panel.
		console.log('Requesting Bluetooth Device...');
		let device = await navigator.bluetooth.requestDevice({
			filters: [{ services: [serviceUuid] }]
		});
		if (!device.gatt) {
			throw new Error('No device GATT found.');
		}
		console.log('Connecting to GATT Server...');
		let server = await device.gatt.connect();

		console.log('Getting Service...');
		let service = await server.getPrimaryService(serviceUuid);

		console.log('Getting Characteristics...');

		let sphCharacteristic = await service.getCharacteristic(sphUuid);
		let colCharacteristic = await service.getCharacteristic(colUuid);
		let accCharacteristic = await service.getCharacteristic(accUuid);
		await accCharacteristic.startNotifications();
		return new QBead({ handlers, sphCharacteristic, colCharacteristic, accCharacteristic });
	}

	get accel() {
		return this.#accel;
	}

	get color() {
		return this.#color;
	}

	async setColor(value: ColorRepresentation) {
		this.#color = new Color(value);
		let colorBytes = Uint8Array.of(
			Math.floor(this.#color.r * 255),
			Math.floor(this.#color.g * 255),
			Math.floor(this.#color.b * 255)
		);
		await this.#colCharacteristic.writeValue(colorBytes);
	}

	get sphereCoord() {
		return this.#sphereCoord;
	}

	async setSphereCoord(coord: BlochVector) {
		this.#sphereCoord = coord;
		const coordBytes = Uint8Array.of(
			Math.floor((this.#sphereCoord.theta * 255) / Math.PI),
			Math.floor((this.#sphereCoord.phi * 255) / (2 * Math.PI))
		);
		await this.#sphCharacteristic.writeValue(coordBytes);
	}
}

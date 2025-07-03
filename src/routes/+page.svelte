<script lang="ts">
	import Handler from './Handler.svelte';
	import 'core-js/features/symbol/observable.js';
	import BlochSphere from './BlochSphere.svelte';
	import { BlochVector } from '@qbead/bloch-sphere';
	import Docs from './Docs.svelte';
	import { Color } from 'three';

	interface QBeadState {
		accel: BlochVector;
		point?: BlochVector;
		color?: any;
		sphCharacteristic: any;
		accCharacteristic: any;
		colCharacteristic: any;
		onTap?: Function;
		onAccelUpdate?: Function;
	}

	let qBeads = $state<Record<string, QBeadState>>({});
	function getAccel(id: string) {
		return qBeads[id].accel;
	}

	async function setLightByAngle(id: string, theta: number, phi: number, color: string) {
		const qBead = qBeads[id];
		qBead.point = BlochVector.fromAngles(theta, phi);
		qBead.color = color;
		let newthetaphi = Uint8Array.of(
			Math.floor((theta * 255) / Math.PI),
			Math.floor((phi * 255) / (2 * Math.PI))
		);
		await qBead.sphCharacteristic.writeValue(newthetaphi);
		const col = new Color(color);

		let newColor = Uint8Array.of(
			Math.floor(col.r * 255),
			Math.floor(col.g * 255),
			Math.floor(col.b * 255)
		);
		await qBead.colCharacteristic.writeValue(newColor);
	}

	const api = { getAccel, setLightByAngle };
	const apiArg = `{${Object.keys(api).join(',')}, self }`;

	async function connectQBead() {
		let serviceUuid = 'e30c1fc6-359c-12be-2544-63d6aa088d45';

		let accUuid = 'e30c1fc9-359c-12be-2544-63d6aa088d45';
		let sphUuid = 'e30c1fc8-359c-12be-2544-63d6aa088d45';
		let colUuid = 'e30c1fc7-359c-12be-2544-63d6aa088d45';

		console.log('Requesting Bluetooth Device...');
		let device = await (navigator as any).bluetooth.requestDevice({
			filters: [{ services: [serviceUuid] }]
		});
		console.log('Connecting to GATT Server...');
		let server = await device.gatt.connect();

		console.log('Getting Service...');
		let service = await server.getPrimaryService(serviceUuid);

		console.log('Getting Characteristics...');

		let sphCharacteristic = await service.getCharacteristic(sphUuid);
		let colCharacteristic = await service.getCharacteristic(colUuid);
		let accCharacteristic = await service.getCharacteristic(accUuid);
		await accCharacteristic.startNotifications();
		console.log('> Notifications started');
		accCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
			new Uint8Array(event.target.value.buffer).reverse();
			let value = event.target.value;
			qBeads[device.id].accel = BlochVector.from(
				value.getFloat32(0),
				value.getFloat32(4),
				value.getFloat32(8)
			);
			qBeads[device.id].onAccelUpdate?.({ ...api, self: device.id });
		});

		qBeads[device.id] = {
			sphCharacteristic,
			colCharacteristic,
			accCharacteristic,
			accel: BlochVector.from(0, 0, -1)
		};
	}

	let idCounter = $state(0);
	// function connectQBeadMock() {
	// 	const id = (idCounter++).toString();
	// 	qBeads[id] = {
	// 		accel: BlochVector.from(0, 0, -1),
	// 		// lightIndex: [0, 0],
	// 		color: 'black'
	// 	};

	// 	setInterval(() => {
	// 		qBeads[id].accel = BlochVector.from(
	// 			clamp((qBeads[id].accel.x ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1),
	// 			clamp((qBeads[id].accel.y ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1),
	// 			clamp((qBeads[id].accel.z ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1)
	// 		);
	// 		qBeads[id].onAccelUpdate?.({ ...api, self: id });
	// 	}, 150);

	// 	function clamp(n: number, min: number, max: number) {
	// 		return Math.max(min, Math.min(max, n));
	// 	}
	// }
</script>

<div>
	<Docs />
	<button onclick={connectQBead}>+ Add QBead</button>
	<div class="qBeadPanels">
		{#each Object.entries(qBeads) as [id, qbead]}
			<section class="qBeadPanel">
				<p>{id}<button onclick={() => navigator.clipboard.writeText(id)}>copy</button></p>
				<button onclick={() => qbead.onTap?.({ ...api, self: id })}>Tap</button>
				<p>
					x: {qbead.accel.x.toFixed(3)}, y: {qbead.accel.y.toFixed(3)}, z: {qbead.accel.z.toFixed(
						3
					)}
				</p>
				<BlochSphere vector={qbead.accel} point={qbead.point} color={qbead.color} />
				<Handler
					title="onAccelUpdate"
					onapply={(text) => {
						qBeads[id].onAccelUpdate = new Function(apiArg, text);
					}}
				/>
				<Handler
					title="onTap"
					onapply={(text) => {
						qBeads[id].onTap = new Function(apiArg, text);
					}}
				/>
			</section>
		{/each}
	</div>
</div>

<style>
	.qBeadPanels {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.qBeadPanel {
		padding: 1rem;
		border: 1px solid black;
		border-radius: 10px;
	}
</style>

<script lang="ts">
	import Handler from './Handler.svelte';
	import 'core-js/features/symbol/observable.js';
	import BlochSphere from './BlochSphere.svelte';
	import { BlochVector } from '@qbead/bloch-sphere';
	import Docs from './Docs.svelte';
	import { Color, type ColorRepresentation } from 'three';

	interface QBeadState {
		name: string;
		loading?: boolean;
		accel: BlochVector;
		sphereCoord?: BlochVector;
		color?: ColorRepresentation;
		sphCharacteristic?: any;
		accCharacteristic?: any;
		colCharacteristic?: any;
		onTap?: Function;
		onAccelUpdate?: Function;
	}

	let qBeads = $state<Record<string, QBeadState>>({});
	function getAccel(id: string) {
		return qBeads[id].accel;
	}

	async function setLightByAngle(
		id: string,
		theta: number,
		phi: number,
		color: ColorRepresentation
	) {
		const qBead = qBeads[id];
		qBead.sphereCoord = BlochVector.fromAngles(theta, phi);
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
		qBeads[device.id] = {
			name: device.name,
			accel: BlochVector.from(0, 0, -1),
			loading: true
		};
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
			name: device.name,
			sphCharacteristic,
			colCharacteristic,
			accCharacteristic,
			accel: BlochVector.from(0, 0, -1)
		};
	}
</script>

<div>
	<Docs />
	<button onclick={connectQBead}>+ Add QBead</button>
	<div class="qBeadPanels">
		{#each Object.entries(qBeads) as [id, qbead]}
			<section class="qBeadPanel">
				<h3>{qbead.name}</h3>
				<p>{id}<button onclick={() => navigator.clipboard.writeText(id)}>copy</button></p>
				{#if qbead.loading}
					<p>Loading...</p>
				{:else}
					<button onclick={() => qbead.onTap?.({ ...api, self: id })}>Tap</button>
					<p>
						x: {qbead.accel.x.toFixed(3)}, y: {qbead.accel.y.toFixed(3)}, z: {qbead.accel.z.toFixed(
							3
						)}
					</p>
					<BlochSphere accel={qbead.accel} sphereCoord={qbead.sphereCoord} color={qbead.color} />
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
				{/if}
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

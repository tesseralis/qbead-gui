<script lang="ts">
	import Handler from './Handler.svelte';
	import BlochSphere from './BlochSphere.svelte';
	import { BlochVector } from '@qbead/bloch-sphere';
	import lzString from 'lz-string';
	import { goto } from '$app/navigation';

	let { qbead = $bindable(), handlerList = $bindable([]), handlerFuncs, index } = $props();
	async function connectQBead() {
		let serviceUuid = 'e30c1fc6-359c-12be-2544-63d6aa088d45';

		let accUuid = 'e30c1fc9-359c-12be-2544-63d6aa088d45';
		let sphUuid = 'e30c1fc8-359c-12be-2544-63d6aa088d45';
		let colUuid = 'e30c1fc7-359c-12be-2544-63d6aa088d45';

		console.log('Requesting Bluetooth Device...');
		let device = await (navigator as any).bluetooth.requestDevice({
			filters: [{ services: [serviceUuid] }]
		});
		qbead = {
			id: device.id,
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
			qbead.accel = BlochVector.from(value.getFloat32(0), value.getFloat32(4), value.getFloat32(8));
			handlerFuncs?.onAccelUpdate();
		});

		qbead = {
			id: device.id,
			name: device.name,
			sphCharacteristic,
			colCharacteristic,
			accCharacteristic,
			accel: BlochVector.from(0, 0, -1)
		};
	}
</script>

<section class="qBeadPanel">
	{#if !qbead.id}
		<button onclick={connectQBead}>Connect</button>
	{:else if qbead.loading}
		<p>Loading...</p>
	{:else}
		<h3>{qbead.name}</h3>
		<p>{qbead.id}</p>
		<button onclick={() => handlerFuncs.onTap?.()}>Tap</button>
		<p>
			x: {qbead.accel.x.toFixed(3)}, y: {qbead.accel.y.toFixed(3)}, z: {qbead.accel.z.toFixed(3)}
		</p>
		<BlochSphere accel={qbead.accel} sphereCoord={qbead.sphereCoord} color={qbead.color} />
	{/if}
	{#each ['onAccelUpdate', 'onTap'] as handlerName}
		<Handler
			title={handlerName}
			bind:text={
				() => handlerList[index][handlerName] || '',
				(text) => {
					handlerList[index][handlerName] = text;
					const hash = lzString.compressToEncodedURIComponent(JSON.stringify(handlerList));
					goto('#' + hash);
				}
			}
		/>
	{/each}
</section>

<style>
	.qBeadPanel {
		padding: 1rem;
		border: 1px solid black;
		border-radius: 10px;
	}
</style>

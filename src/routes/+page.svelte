<script lang="ts">
	import Handler from './Handler.svelte';

	let qBeads = $state<Record<string, any>>({});
	function getAccel(id: string) {
		return qBeads[id]?.accel;
	}

	// TODO affect phi and theta
	function setLightByAngle(id: string, phi: number, theta: number, color: string) {
		qBeads[id].color = color;
	}
	const api = { getAccel, setLightByAngle };
	const apiArg = `{${Object.keys(api).join(',')}}`;

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
			qBeads[device.id].accel = {
				x: value.getFloat32(0),
				y: value.getFloat32(4),
				z: value.getFloat32(8)
			};
		});

		qBeads[device.id] = {
			sphCharacteristic,
			colCharacteristic,
			accCharacteristic,
			accel: { x: 0, y: 0, z: 0 }
		};
	}

	let idCounter = $state(0);
	function connectQBeadMock() {
		const id = (idCounter++).toString();
		qBeads[id] = {
			accel: { x: 0, y: 0, z: 0 },
			lightIndex: [0, 0],
			color: 'black'
		};

		setInterval(() => {
			qBeads[id].accel = {
				x: clamp((qBeads[id].x ?? 0) + (Math.random() - 0.5), -1, 1),
				y: clamp((qBeads[id].y ?? 0) + (Math.random() - 0.5), -1, 1),
				z: clamp((qBeads[id].z ?? 0) + (Math.random() - 0.5), -1, 1)
			};
		}, 150);

		function clamp(n: number, min: number, max: number) {
			return Math.max(min, Math.min(max, n));
		}
	}
</script>

<div>
	<details>
		<summary>API</summary>
		<ul>
			<li>
				<code>getAccel(id: string)</code> - gets the acceleration data of the QBead a
				<code>{`{x, y, z}`}</code> object.
			</li>
			<li>
				<code> setLightByAngle(id: string, phi: number, theta: number, color: string) </code> - set
				the color of the QBead with the given angle and color string. Any
				<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value" target="blank">
					color accepted by CSS
				</a> is available.
			</li>
		</ul>
	</details>
	<button onclick={connectQBead}>+ Add QBead</button>
	<div class="qBeadPanels">
		{#each Object.entries(qBeads) as [id, qbead]}
			<section class="qBeadPanel">
				<p>{id}</p>
				<button onclick={() => qbead.onTap?.(api)}>Tap</button>
				<p>
					x: {qbead.accel.x.toFixed(3)}, y: {qbead.accel.y.toFixed(3)}, z: {qbead.accel.z.toFixed(
						3
					)}
				</p>
				<!-- TODO replace with actual visualizer -->
				<svg class="visualizer" viewBox="-50 -50 100 100">
					<circle r="40" stroke="black" fill={qbead.color} />
				</svg>
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

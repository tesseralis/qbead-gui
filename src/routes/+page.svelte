<script lang="ts">
	import { v4 as uuid } from 'uuid';
	import Handler from './Handler.svelte';
	import 'core-js/features/symbol/observable.js';
	import BlochSphere from './BlochSphere.svelte';
	import { BlochVector } from '@qbead/bloch-sphere';

	interface QBeadState {
		accel: { x: number; y: number; z: number };
		color: any;
		onTap?: Function;
		onAccelUpdate?: Function;
	}

	let qBeads = $state<Record<string, QBeadState>>({});
	function getAccel(id: string) {
		return qBeads[id]?.accel;
	}

	// TODO affect phi and theta
	function setLightByAngle(id: string, phi: number, theta: number, color: string) {
		qBeads[id].color = color;
	}
	const api = { getAccel, setLightByAngle };
	const apiArg = `{${Object.keys(api).join(',')}}`;

	// let idCounter = $state(0);
	function connectQBead() {
		const id = uuid();
		qBeads[id] = {
			accel: { x: 0, y: 0, z: -1 },
			// lightIndex: [0, 0],
			color: 'black'
		};

		setInterval(() => {
			qBeads[id].accel = {
				x: clamp((qBeads[id].accel.x ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1),
				y: clamp((qBeads[id].accel.y ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1),
				z: clamp((qBeads[id].accel.z ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1)
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
				<p>{id}<button onclick={() => navigator.clipboard.writeText(id)}>copy</button></p>
				<button onclick={() => qbead.onTap?.(api)}>Tap</button>
				<p>
					x: {qbead.accel.x.toFixed(3)}, y: {qbead.accel.y.toFixed(3)}, z: {qbead.accel.z.toFixed(
						3
					)}
				</p>
				<BlochSphere
					vector={(
						BlochVector.from(qbead.accel.x, qbead.accel.y, qbead.accel.z) as any
					).normalize()}
					color={qbead.color}
				/>
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

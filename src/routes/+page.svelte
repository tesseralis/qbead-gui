<script lang="ts">
	import { v4 as uuid } from 'uuid';
	import Handler from './Handler.svelte';
	import 'core-js/features/symbol/observable.js';
	import BlochSphere from './BlochSphere.svelte';
	import { BlochVector } from '@qbead/bloch-sphere';
	import Docs from './Docs.svelte';

	interface QBeadState {
		// accel: BlochVector;
		accel: any; // FIXME should be BlochVector
		point?: any; // FIXME should be BlochVector
		color: any;
		onTap?: Function;
		onAccelUpdate?: Function;
	}

	let qBeads = $state<Record<string, QBeadState>>({});
	function getAccel(id: string) {
		return qBeads[id].accel;
	}

	// TODO affect phi and theta
	function setLightByAngle(id: string, theta: number, phi: number, color: string) {
		qBeads[id].point = BlochVector.fromAngles(theta, phi);
		qBeads[id].color = color;
	}
	const api = { getAccel, setLightByAngle };
	const apiArg = `{${Object.keys(api).join(',')}, self }`;

	function connectQBead() {
		const id = uuid();
		qBeads[id] = {
			accel: BlochVector.from(0, 0, -1),
			// lightIndex: [0, 0],
			color: 'black'
		};

		setInterval(() => {
			qBeads[id].accel = BlochVector.from(
				clamp((qBeads[id].accel.x ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1),
				clamp((qBeads[id].accel.y ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1),
				clamp((qBeads[id].accel.z ?? 0) + (1 / 16) * (Math.random() - 0.5), -1, 1)
			);
			qBeads[id].onAccelUpdate?.({ ...api, self: id });
		}, 150);

		function clamp(n: number, min: number, max: number) {
			return Math.max(min, Math.min(max, n));
		}
	}
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

<script lang="ts">
	import 'core-js/features/symbol/observable.js';
	import { BlochVector } from '@qbead/bloch-sphere';
	import Docs from './Docs.svelte';
	import { Color, type ColorRepresentation } from 'three';
	import QBeadPanel from './QBeadPanel.svelte';

	interface QBeadState {
		id: string;
		name?: string;
		loading?: boolean;
		accel?: BlochVector;
		sphereCoord?: BlochVector;
		color?: ColorRepresentation;
		sphCharacteristic?: any;
		accCharacteristic?: any;
		colCharacteristic?: any;
		onTap?: Function;
		onAccelUpdate?: Function;
	}

	let qBeads = $state<QBeadState[]>([]);

	function getAccel(id: string) {
		return qBeads.find((qbead) => qbead.id === id)?.accel;
	}

	async function setLightByAngle(
		id: string,
		theta: number,
		phi: number,
		color: ColorRepresentation
	) {
		const qBead = qBeads.find((qbead) => qbead.id === id);
		if (!qBead) {
			return;
		}
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

	function addPanel() {
		qBeads.push({ id: '' });
	}
</script>

<div>
	<Docs />
	<button onclick={addPanel}>+ Add Panel</button>
	<div class="qBeadPanels">
		{#each qBeads as qbead, i}
			<QBeadPanel bind:qbead={qBeads[i]} {api} {apiArg} />
		{/each}
	</div>
</div>

<style>
	.qBeadPanels {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
</style>

<script lang="ts">
	import 'core-js/features/symbol/observable.js';
	import { BlochVector } from '@qbead/bloch-sphere';
	import Docs from './Docs.svelte';
	import { Color, type ColorRepresentation } from 'three';
	import QBeadPanel from './QBeadPanel.svelte';
	import lzString from 'lz-string';

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
	}

	interface Handlers {
		onTap?: string;
		onAccelUpdate?: string;
	}

	interface HandlerFuncs {
		onTap?: Function;
		onAccelUpdate?: Function;
	}

	const hash = window.location.hash.slice(1);
	const handlerText = JSON.parse(lzString.decompressFromEncodedURIComponent(hash)) ?? [];
	let handlerList = $state<Handlers[]>(handlerText);
	const handlerFuncs = $derived(
		handlerList.map((handlers, index) => {
			const handlerFuncs: HandlerFuncs = {};
			for (let funcName of ['onTap', 'onAccelUpdate'] as const) {
				const func = new Function(apiArg, handlers[funcName] || '');
				handlerFuncs[funcName] = () => {
					func({ ...api, self: index });
				};
			}
			return handlerFuncs;
		})
	);

	let qBeads = $state<QBeadState[]>(handlerText.map(() => ({ id: '' })));

	function getAccel(index: number) {
		return qBeads[index]?.accel;
	}

	async function setLightByAngle(
		index: number,
		theta: number,
		phi: number,
		color: ColorRepresentation
	) {
		const qBead = qBeads[index];
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
		handlerList.push({});
	}
</script>

<div>
	<Docs />
	<button onclick={addPanel}>+ Add Panel</button>
	<div class="qBeadPanels">
		{#each handlerList as _, i}
			<QBeadPanel
				index={i}
				bind:qbead={qBeads[i]}
				handlerFuncs={handlerFuncs[i]}
				bind:handlerList
			/>
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

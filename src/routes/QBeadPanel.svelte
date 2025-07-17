<script lang="ts">
	import Handler from './Handler.svelte';
	import BlochSphere from './BlochSphere.svelte';
	import lzString from 'lz-string';
	import { goto } from '$app/navigation';
	import QBead from './QBead.svelte';

	let { qBeads = $bindable(), handlerList = $bindable([]), handlerFuncs, index } = $props();

	let loading = $state(false);
	const qBead = $derived(qBeads[index]);
</script>

<section class="qBeadPanel">
	{#if !qBead}
		<button
			onclick={async () => {
				loading = true;
				qBeads[index] = await QBead.connect(handlerFuncs);
				loading = false;
			}}>Connect</button
		>
	{:else if loading}
		<p>Loading...</p>
	{:else}
		<h3>qBeads[{index}]</h3>
		<!-- <h3>{qbead.name}</h3>
		<p>{qbead.id}</p> -->
		<p>
			x: {qBead.accel.x.toFixed(3)}, y: {qBead.accel.y.toFixed(3)}, z: {qBead.accel.z.toFixed(3)}
		</p>
		<BlochSphere accel={qBead.accel} sphereCoord={qBead.sphereCoord} color={qBead.color} />
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
	h3 {
		font-size: 1.25rem;
		font-family: monospace;
	}
	.qBeadPanel {
		padding: 1rem;
		border: 1px solid black;
		border-radius: 10px;
	}
</style>

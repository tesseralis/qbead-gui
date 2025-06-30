<script lang="ts">
	import { onMount } from 'svelte';
	import { BlochSphere, QubitDisplay } from '@qbead/bloch-sphere';

	const { vector } = $props();
	let container: HTMLElement | undefined = $state();
	const blochSphere = new BlochSphere({ fontSize: 1.25 });
	let qubit = new QubitDisplay();

	onMount(async () => {
		if (!container) return;
		blochSphere.attach(container);
		qubit.set(vector);
		blochSphere.add(qubit);
	});

	$effect(() => {
		qubit.set(vector, 100);
	});
</script>

<svelte:window
	onresize={() => {
		blochSphere.resize();
	}}
/>
<div class="bloch-sphere" bind:this={container}></div>

<style>
	.bloch-sphere {
		width: 600px;
		height: 600px;
		position: relative;
	}
</style>

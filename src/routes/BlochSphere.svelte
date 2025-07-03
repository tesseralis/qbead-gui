<script lang="ts">
	import { onMount } from 'svelte';
	import { BlochSphere, BlochVector, PointsDisplay, QubitDisplay } from '@qbead/bloch-sphere';
	import type { ColorRepresentation } from 'three';

	interface Props {
		// The Bloch Sphere's current acceleration
		accel: BlochVector;
		// The current lit point
		sphereCoord?: BlochVector;
		color?: ColorRepresentation;
	}

	const { accel: vector, sphereCoord: point, color }: Props = $props();
	let container: HTMLElement | undefined = $state();
	const blochSphere = new BlochSphere({ fontSize: 1.25 });
	let qubit = new QubitDisplay();
	let points = new PointsDisplay();

	onMount(async () => {
		if (!container) return;
		blochSphere.attach(container);
		qubit.set(vector);
		blochSphere.add(qubit);
		blochSphere.add(points);
		if (point && color) {
			points.set([point]);
			points.color = color;
		}
	});

	$effect(() => {
		qubit.set(vector);
	});

	$effect(() => {
		if (point) {
			points.set([point]);
		}
	});

	$effect(() => {
		if (color) {
			points.color = color;
		}
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
		width: 400px;
		height: 400px;
		position: relative;
	}
</style>

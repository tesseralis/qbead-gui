<script lang="ts">
	interface Props {
		title: string;
		onapply(text: string): void;
	}
	const { title, onapply }: Props = $props();
	let text = $state('');
</script>

<div class="function">
	<label
		><h2>{title}</h2>
		<textarea bind:value={text}></textarea>
	</label>
	<button onclick={() => onapply(text)}>Apply</button>
</div>

<style>
	.function {
		display: flex;
		flex-direction: column;
	}

	.function textarea {
		width: 100%;
		height: 99px;
	}
</style>

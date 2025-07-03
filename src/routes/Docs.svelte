<details>
	<summary>API</summary>
	<ul>
		<li>
			<code>self</code> - the id of the current QBead.
		</li>
		<li>
			<code>getAccel(id: string)</code> - gets the acceleration data of the QBead as a
			<a href="https://qbead.gitbook.io/bloch-sphere/classes/blochvector">
				<code>BlochVector</code>
			</a>.
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

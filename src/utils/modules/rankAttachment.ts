import Canvas from "canvas";

/**
 * !### ALL CODE BELONG TO @CANVACORD ###
 * ? WE ONLY MODIFIED THE {_calculateProgress} FUNCTION
 *
 * This file provides a `Rank` class to generate a customizable rank card (often
 * used in Discord-like leveling systems). It handles backgrounds (colors or images),
 * avatars, progress bars, statuses, text, and other styling options.
 */

/**
 * The shape of the data needed to create a rank card.
 */
type CanvacordRankData = {
	/**
	 * The total width of the rank card canvas.
	 */
	width: number;

	/**
	 * The total height of the rank card canvas.
	 */
	height: number;

	/**
	 * An object describing the background of the rank card.
	 */
	background: {
		/**
		 * The type of background to use. Can be "image" or "color".
		 */
		type?: "image" | "color";

		/**
		 * The background image source (if type is "image") or
		 * a string representing the color (if type is "color").
		 */
		image?: string;
	};

	/**
	 * An object describing the progress bar settings.
	 */
	progressBar: {
		/**
		 * Whether the progress bar should have rounded edges.
		 */
		rounded?: boolean;

		/**
		 * The x-coordinate of the progress bar.
		 */
		x?: number;

		/**
		 * The y-coordinate of the progress bar.
		 */
		y?: number;

		/**
		 * The height of the progress bar.
		 */
		height?: number;

		/**
		 * The width of the progress bar.
		 */
		width?: number;

		/**
		 * Settings for the progress bar background (the "track").
		 */
		track?: {
			/**
			 * The color of the progress bar track (behind the filled portion).
			 */
			color?: string;
		};

		/**
		 * Settings for the progress bar's fill.
		 */
		bar?: {
			/**
			 * The type of fill for the progress bar: "color" or "gradient".
			 */
			type?: "color" | "gradient";

			/**
			 * A single color string (if type is "color") or an array of color strings (if type is "gradient").
			 */
			color?: string | string[];
		};
	};

	/**
	 * An optional overlay placed on top of the background.
	 */
	overlay: {
		/**
		 * If true, the overlay will be displayed on the card.
		 */
		display?: boolean;

		/**
		 * The alpha/opacity level of the overlay (0 to 1).
		 */
		level?: number;

		/**
		 * The color of the overlay, e.g. "#333640".
		 */
		color?: string;
	};

	/**
	 * Avatar settings.
	 */
	avatar: {
		/**
		 * The source (URL/path) of the user avatar image.
		 */
		source?: string;

		/**
		 * The avatar's x-position on the rank card canvas.
		 */
		x?: number;

		/**
		 * The avatar's y-position on the rank card canvas.
		 */
		y?: number;

		/**
		 * The avatar's display height on the rank card canvas.
		 */
		height?: number;

		/**
		 * The avatar's display width on the rank card canvas.
		 */
		width?: number;
	};

	/**
	 * Object describing the user status indicator.
	 */
	status: {
		/**
		 * How thick the status ring or circle is if drawn as a ring.
		 */
		width?: number;

		/**
		 * The status type: "online", "dnd", "idle", "offline", "streaming".
		 */
		type?: "online" | "dnd" | "idle" | "offline" | "streaming";

		/**
		 * The color used for the status indicator.
		 */
		color?: string;

		/**
		 * If true, the status will be drawn as a filled circle. If false, drawn as a ring.
		 */
		circle?: boolean;
	};

	/**
	 * Rank settings.
	 */
	rank: {
		/**
		 * If true, displays the rank text.
		 */
		display?: boolean;

		/**
		 * The numerical rank value.
		 */
		data?: number;

		/**
		 * The color of the rank label text.
		 */
		textColor?: string;

		/**
		 * The color of the numeric rank value.
		 */
		color?: string;

		/**
		 * The label to display, e.g., "RANK".
		 */
		displayText?: string;
	};

	/**
	 * Level settings.
	 */
	level: {
		/**
		 * If true, displays the level text.
		 */
		display?: boolean;

		/**
		 * The numerical level value.
		 */
		data?: number;

		/**
		 * The color of the level label text.
		 */
		textColor?: string;

		/**
		 * The color of the numeric level value.
		 */
		color?: string;

		/**
		 * The label to display, e.g., "LEVEL".
		 */
		displayText?: string;
	};

	/**
	 * The user's current XP, which is displayed on the rank card.
	 */
	currentXP: {
		data?: number;
		color?: string;
	};

	/**
	 * The XP needed to reach the next level.
	 */
	requiredXP: {
		data?: number;
		color?: string;
	};

	/**
	 * The previous XP value (the XP required to attain the *current* level).
	 * Useful for calculating partial progress.
	 */
	previousXP: {
		data?: number;
		color?: string;
	};

	/**
	 * The user's discriminator (the 4-digit suffix, e.g., #1234).
	 */
	discriminator: {
		discrim?: number | string;
		color?: string;
	};

	/**
	 * The user's display name or username.
	 */
	username: {
		name?: string;
		color?: string;
	};

	/**
	 * If true, attempts to render emojis in the username (requires an emoji-capable font).
	 */
	renderEmojis?: boolean;
};

/**
 * The Rank class creates a rank card image Buffer using Node-Canvas based on specified data.
 * You can customize backgrounds (images or colors), avatars, XP bars, overlay, username, status,
 * rank, level, and more.
 *
 * Example usage:
 * ```ts
 * const rank = new canvacord.Rank()
 *    .setAvatar(img)
 *    .setCurrentXP(203)
 *    .setRequiredXP(500)
 *    .setStatus("dnd")
 *    .setProgressBar(["#FF0000", "#0000FF"], "GRADIENT")
 *    .setUsername("Snowflake")
 *    .setDiscriminator("0007");
 *
 * rank.build()
 *    .then(data => {
 *       canvacord.write(data, "RankCard.png");
 *    });
 * ```
 */
export class Rank {
	/**
	 * Holds all customizable data necessary to build the rank card.
	 *
	 * @private
	 */
	private data: CanvacordRankData;

	/**
	 * Creates a new Rank card instance with default values (size, colors, fonts, etc.).
	 * Automatically registers default fonts (e.g. Manrope) if no custom fonts are provided.
	 */
	constructor() {
		this.data = {
			width: 934,
			height: 282,
			background: {
				type: "color",
				image: "#23272A",
			},
			progressBar: {
				rounded: true,
				x: 275.5,
				y: 183.75,
				height: 37.5,
				width: 596.5,
				track: {
					color: "#484b4E",
				},
				bar: {
					type: "color",
					color: "#FFFFFF",
				},
			},
			overlay: {
				display: true,
				level: 0.5,
				color: "#333640",
			},
			avatar: {
				source: "",
				x: 70,
				y: 50,
				height: 180,
				width: 180,
			},
			status: {
				width: 5,
				type: "online",
				color: "#43B581",
				circle: false,
			},
			rank: {
				display: true,
				data: 1,
				textColor: "#FFFFFF",
				color: "#F3F3F3",
				displayText: "RANK",
			},
			level: {
				display: true,
				data: 1,
				textColor: "#FFFFFF",
				color: "#F3F3F3",
				displayText: "LEVEL",
			},
			currentXP: {
				data: 0,
				color: "#FFFFFF",
			},
			requiredXP: {
				data: 0,
				color: "#FFFFFF",
			},
			previousXP: {
				data: 0,
				color: "#FFFFFF",
			},
			discriminator: {
				discrim: "",
				color: "rgba(255, 255, 255, 0.4)",
			},
			username: {
				name: "",
				color: "#FFFFFF",
			},
			renderEmojis: false,
		};

		// Load default fonts or any user-provided fonts
		this.registerFonts();
	}

	/**
	 * Registers font families to be used by the Node-Canvas context.
	 * By default, it registers two variants of the Manrope font.
	 *
	 * @param {any[]} fontArray - An array of font objects (with `path` and `face`).
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @example
	 * rank.registerFonts([
	 *   { path: "./fonts/MyCustomFont-Bold.ttf", face: { family: "CustomFont", weight: "bold" } },
	 *   { path: "./fonts/MyCustomFont-Regular.ttf", face: { family: "CustomFont", weight: "regular" } }
	 * ]);
	 */
	registerFonts(fontArray: any[] = []): Rank {
		if (!fontArray.length) {
			// Register default fonts asynchronously
			setTimeout(() => {
				Canvas.registerFont("./././fonts/MANROPE_BOLD.ttf", {
					family: "Manrope",
					weight: "bold",
					style: "normal",
				});

				Canvas.registerFont("./././fonts/MANROPE_REGULAR.ttf", {
					family: "Manrope",
					weight: "regular",
					style: "normal",
				});
			}, 250);
		} else {
			// Register each provided font
			fontArray.forEach((font) => {
				Canvas.registerFont(font.path, font.face);
			});
		}

		return this;
	}

	/**
	 * If set to true, emojis in the username (if any) will be rendered. This
	 * requires a font that supports emojis to be registered beforehand.
	 *
	 * @param {boolean} [apply=false] - Set it to `true` to render emojis in the username text.
	 * @returns {Rank} The Rank instance for chaining.
	 */
	renderEmojis(apply: boolean = false): Rank {
		this.data.renderEmojis = !!apply;
		return this;
	}

	/**
	 * Sets the username to display on the rank card.
	 *
	 * @param {string} name - The username to display.
	 * @param {string} [color="#FFFFFF"] - The color of the username text.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If the `name` parameter is not a string.
	 */
	setUsername(name: string, color: string = "#FFFFFF"): Rank {
		if (typeof name !== "string") {
			throw new Error(
				`Expected username to be a string, received ${typeof name}!`
			);
		}
		this.data.username.name = name;
		this.data.username.color =
			color && typeof color === "string" ? color : "#FFFFFF";
		return this;
	}

	/**
	 * Sets the discriminator (the 4-digit #0000 part) for the user.
	 *
	 * @param {string|number} [discriminator] - The user's discriminator value.
	 * @param {string} [color="rgba(255, 255, 255, 0.4)"] - The color for the discriminator text.
	 * @returns {Rank} The Rank instance for chaining.
	 */
	setDiscriminator(
		discriminator?: string | number,
		color: string = "rgba(255, 255, 255, 0.4)"
	): Rank {
		this.data.discriminator.discrim =
			!isNaN(discriminator as number) && `${discriminator}`.length === 4
				? discriminator
				: "0";
		this.data.discriminator.color =
			color && typeof color === "string" ? color : "rgba(255, 255, 255, 0.4)";
		return this;
	}

	/**
	 * Sets the progress bar's style (color or gradient), the fill type, and whether it should be rounded.
	 *
	 * @param {string|string[]} color - The progress bar color if fillType is "COLOR",
	 *   or an array of colors if fillType is "GRADIENT".
	 * @param {"COLOR"|"GRADIENT"} [fillType="COLOR"] - Indicates whether the progress bar is a single color or a gradient.
	 * @param {boolean} [rounded=true] - If true, the progress bar is drawn with rounded corners.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If a non-string color is used for "COLOR", or a non-array color is used for "GRADIENT".
	 */
	setProgressBar(
		color: string | string[],
		fillType: "COLOR" | "GRADIENT" = "COLOR",
		rounded: boolean = true
	): Rank {
		switch (fillType) {
			case "COLOR":
				if (typeof color !== "string") {
					throw new Error(
						`Color type must be a string, received ${typeof color}!`
					);
				}
				this.data.progressBar.bar!.color = color;
				this.data.progressBar.bar!.type = "color";
				this.data.progressBar.rounded = !!rounded;
				break;

			case "GRADIENT":
				if (!Array.isArray(color)) {
					throw new Error(
						`Color type must be Array, received ${typeof color}!`
					);
				}
				// Only use up to 2 color stops for the gradient
				this.data.progressBar.bar!.color = color.slice(0, 2);
				this.data.progressBar.bar!.type = "gradient";
				this.data.progressBar.rounded = !!rounded;
				break;

			default:
				throw new Error(`Unsupported progressbar type "${fillType}"!`);
		}

		return this;
	}

	/**
	 * Sets the track color for the progress bar (the background behind the fill).
	 *
	 * @param {string} color - A valid CSS color string.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If color is not a string.
	 */
	setProgressBarTrack(color: string): Rank {
		if (typeof color !== "string") {
			throw new Error(
				`Color type must be a string, received "${typeof color}"!`
			);
		}
		this.data.progressBar.track!.color = color;
		return this;
	}

	/**
	 * Sets an overlay that covers the card area (excluding a small padding).
	 *
	 * @param {string} color - A valid CSS color for the overlay.
	 * @param {number} [level=0.5] - The opacity level (0 to 1).
	 * @param {boolean} [display=true] - If false, the overlay won't be drawn.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If color is not a string.
	 */
	setOverlay(
		color: string,
		level: number = 0.5,
		display: boolean = true
	): Rank {
		if (typeof color !== "string") {
			throw new Error(
				`Color type must be a string, received "${typeof color}"!`
			);
		}
		this.data.overlay.color = color;
		this.data.overlay.display = !!display;
		this.data.overlay.level = level && typeof level === "number" ? level : 0.5;
		return this;
	}

	/**
	 * Sets the required XP needed to level up.
	 *
	 * @param {number} data - The required XP value.
	 * @param {string} [color="#FFFFFF"] - The color for displaying the XP text.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If data is not a number.
	 */
	setRequiredXP(data: number, color: string = "#FFFFFF"): Rank {
		if (typeof data !== "number") {
			throw new Error(
				`Required xp data type must be a number, received ${typeof data}!`
			);
		}
		this.data.requiredXP.data = data;
		this.data.requiredXP.color =
			color && typeof color === "string" ? color : "#FFFFFF";
		return this;
	}

	/**
	 * Sets the XP that the user had at the previous level. Used to calculate partial progress.
	 *
	 * @param {number} data - The previous XP value.
	 * @param {string} [color="#FFFFFF"] - The color for displaying the XP text.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If data is not a number.
	 */
	setPreviousXP(data: number, color: string = "#FFFFFF"): Rank {
		if (typeof data !== "number") {
			throw new Error(
				`Previous xp data type must be a number, received ${typeof data}!`
			);
		}
		this.data.previousXP.data = data;
		this.data.previousXP.color =
			color && typeof color === "string" ? color : "#FFFFFF";
		return this;
	}

	/**
	 * Sets the current XP of the user.
	 *
	 * @param {number} data - The current XP value.
	 * @param {string} [color="#FFFFFF"] - The color for displaying the XP text.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If data is not a number.
	 */
	setCurrentXP(data: number, color: string = "#FFFFFF"): Rank {
		if (typeof data !== "number") {
			throw new Error(
				`Current xp data type must be a number, received ${typeof data}!`
			);
		}
		this.data.currentXP.data = data;
		this.data.currentXP.color =
			color && typeof color === "string" ? color : "#FFFFFF";
		return this;
	}

	/**
	 * Sets the rank data and label for the user.
	 *
	 * @param {number} data - The numeric rank value to display.
	 * @param {string} [text="RANK"] - The text label for the rank.
	 * @param {boolean} [display=true] - If false, the rank won't be displayed.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If data is not a number.
	 */
	setRank(data: number, text: string = "RANK", display: boolean = true): Rank {
		if (typeof data !== "number") {
			throw new Error(`Level data must be a number, received ${typeof data}!`);
		}
		this.data.rank.data = data;
		this.data.rank.display = !!display;
		if (!text || typeof text !== "string") text = "RANK";
		this.data.rank.displayText = text;

		return this;
	}

	/**
	 * Sets the colors for the rank text and the numeric rank value.
	 *
	 * @param {string} [text="#FFFFFF"] - Color for the "RANK" label text.
	 * @param {string} [number="#FFFFFF"] - Color for the numeric rank value.
	 * @returns {Rank} The Rank instance for chaining.
	 */
	setRankColor(text: string = "#FFFFFF", number: string = "#FFFFFF"): Rank {
		if (!text || typeof text !== "string") text = "#FFFFFF";
		if (!number || typeof number !== "string") number = "#FFFFFF";
		this.data.rank.textColor = text;
		this.data.rank.color = number;
		return this;
	}

	/**
	 * Sets the colors for the level text and the numeric level value.
	 *
	 * @param {string} [text="#FFFFFF"] - Color for the "LEVEL" label.
	 * @param {string} [number="#FFFFFF"] - Color for the numeric level value.
	 * @returns {Rank} The Rank instance for chaining.
	 */
	setLevelColor(text: string = "#FFFFFF", number: string = "#FFFFFF"): Rank {
		if (!text || typeof text !== "string") text = "#FFFFFF";
		if (!number || typeof number !== "string") number = "#FFFFFF";
		this.data.level.textColor = text;
		this.data.level.color = number;
		return this;
	}

	/**
	 * Sets the level data and label for the user.
	 *
	 * @param {number} data - The numeric level value to display.
	 * @param {string} [text="LEVEL"] - The label text for the level.
	 * @param {boolean} [display=true] - If false, the level won't be displayed.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If data is not a number.
	 */
	setLevel(
		data: number,
		text: string = "LEVEL",
		display: boolean = true
	): Rank {
		if (typeof data !== "number") {
			throw new Error(`Level data must be a number, received ${typeof data}!`);
		}
		this.data.level.data = data;
		this.data.level.display = !!display;
		if (!text || typeof text !== "string") text = "LEVEL";
		this.data.level.displayText = text;

		return this;
	}

	/**
	 * Sets a custom color for the user status indicator, overriding the default color.
	 *
	 * @param {string} color - A valid CSS color string, e.g., "#ff0000".
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If color is not a valid string.
	 */
	setCustomStatusColor(color: string): Rank {
		if (!color || typeof color !== "string") {
			throw new Error("Invalid color!");
		}
		this.data.status.color = color;
		return this;
	}

	/**
	 * Sets the user status (online, dnd, idle, offline, streaming) and
	 * whether it should be drawn as a circle or ring, plus the ring width.
	 *
	 * @param {"online"|"idle"|"dnd"|"offline"|"streaming"} status - The user status.
	 * @param {boolean} [circle=false] - If true, the status is drawn as a filled circle.
	 * @param {number|boolean} [width=5] - The width for the ring if circle is false. If 0, no ring is drawn.
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If status is not one of the valid status strings.
	 */
	setStatus(
		status: "online" | "idle" | "dnd" | "offline" | "streaming",
		circle: boolean = false,
		width: number | boolean = 5
	): Rank {
		switch (status) {
			case "online":
				this.data.status.type = "online";
				this.data.status.color = "#43B581";
				break;
			case "idle":
				this.data.status.type = "idle";
				this.data.status.color = "#FAA61A";
				break;
			case "dnd":
				this.data.status.type = "dnd";
				this.data.status.color = "#F04747";
				break;
			case "offline":
				this.data.status.type = "offline";
				this.data.status.color = "#747F8E";
				break;
			case "streaming":
				this.data.status.type = "streaming";
				this.data.status.color = "#593595";
				break;
			default:
				throw new Error(`Invalid status "${status}"`);
		}

		// Set the ring width only if not zero.
		if (width !== 0) {
			this.data.status.width = typeof width === "number" ? width : 5;
		} else {
			this.data.status.width = 0;
		}

		// Determine if the status is drawn as a filled circle or ring.
		if ([true, false].includes(circle)) {
			this.data.status.circle = circle;
		}

		return this;
	}

	/**
	 * Sets the background of the rank card, either a solid color or an image.
	 *
	 * @param {"COLOR"|"IMAGE"} type - The background type.
	 * @param {string} data - A valid CSS color string if type is "COLOR", or the
	 *   path/URL to an image if type is "IMAGE".
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If `data` is not provided or the background type is invalid.
	 */
	setBackground(type: "COLOR" | "IMAGE", data: string): Rank {
		if (!data) throw new Error("Missing field : data");
		switch (type) {
			case "COLOR":
				this.data.background.type = "color";
				this.data.background.image =
					data && typeof data === "string" ? data : "#23272A";
				break;
			case "IMAGE":
				this.data.background.type = "image";
				this.data.background.image = data;
				break;
			default:
				throw new Error(`Unsupported background type "${type}"`);
		}

		return this;
	}

	/**
	 * Sets the user's avatar image to be displayed in the rank card.
	 *
	 * @param {string} data - The image source (URL, local path, or base64).
	 * @returns {Rank} The Rank instance for chaining.
	 *
	 * @throws {Error} If the data argument is not provided.
	 */
	setAvatar(data: string): Rank {
		if (!data) {
			throw new Error(`Invalid avatar type "${typeof data}"!`);
		}
		this.data.avatar.source = data;
		return this;
	}

	/**
	 * Builds the rank card and returns a `Promise<Buffer>` containing the image data.
	 *
	 * @param {object} [ops] - Optional font options.
	 * @param {string} [ops.fontX="Manrope"] - The font family name used for bold text.
	 * @param {string} [ops.fontY="Manrope"] - The font family name used for regular text.
	 * @returns {Promise<Buffer>} A promise that resolves with a Node Buffer of the PNG image.
	 *
	 * @throws {Error} If required fields (currentXP, requiredXP, avatar source, username) are missing.
	 */
	async build(ops = { fontX: "Manrope", fontY: "Manrope" }): Promise<Buffer> {
		// Check for required data
		if (typeof this.data.currentXP.data !== "number") {
			throw new Error(
				`Expected currentXP to be a number, received ${typeof this.data
					.currentXP.data}!`
			);
		}
		if (typeof this.data.requiredXP.data !== "number") {
			throw new Error(
				`Expected requiredXP to be a number, received ${typeof this.data
					.requiredXP.data}!`
			);
		}
		if (!this.data.avatar.source) {
			throw new Error("Avatar source not found!");
		}
		if (!this.data.username.name) {
			throw new Error("Missing username");
		}

		// Load background image if needed
		let bg = null;
		if (this.data.background.type === "image") {
			bg = await Canvas.loadImage(this.data.background.image!);
		}

		// Load the avatar
		let avatar = await Canvas.loadImage(this.data.avatar.source);

		// Create the canvas
		const canvas = Canvas.createCanvas(this.data.width, this.data.height);
		const ctx = canvas.getContext("2d");

		// Draw the background (either solid color or the loaded image)
		if (bg) {
			ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
		} else {
			ctx.fillStyle = this.data.background.image!;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		// Add overlay if enabled
		if (this.data.overlay.display) {
			ctx.globalAlpha = this.data.overlay.level || 1;
			ctx.fillStyle = this.data.overlay.color!;
			ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
		}

		// Reset alpha (fully opaque)
		ctx.globalAlpha = 1;

		// Draw username
		ctx.font = `bold 36px ${ops.fontX}`;
		ctx.fillStyle = this.data.username.color!;
		ctx.textAlign = "start";
		// Shorten username if it's too long
		const name = shorten(this.data.username.name, 10);
		ctx.fillText(`@${name}`, 257 + 18.5, 164);

		// Draw discriminator if it exists
		if (this.data.discriminator.discrim) {
			const discrim = `${this.data.discriminator.discrim}`;
			if (discrim) {
				ctx.font = `36px ${ops.fontY}`;
				ctx.fillStyle = this.data.discriminator.color!;
				ctx.textAlign = "center";
				ctx.fillText(
					`#${discrim.substring(0, 4)}`,
					// This X position ensures it lines up to the right of the username
					ctx.measureText(name).width + 20 + 335,
					164
				);
			}
		}

		// Draw level text
		if (this.data.level.display && !isNaN(this.data.level.data!)) {
			ctx.font = `bold 36px ${ops.fontX}`;
			ctx.fillStyle = this.data.level.textColor!;
			ctx.fillText(
				this.data.level.displayText!,
				800 -
					ctx.measureText(
						toAbbrev(parseInt(this.data.level.data!.toString())) as string
					).width,
				82
			);

			ctx.font = `bold 32px ${ops.fontX}`;
			ctx.fillStyle = this.data.level.color!;
			ctx.textAlign = "end";
			ctx.fillText(
				toAbbrev(parseInt(this.data.level.data!.toString())) as string,
				860,
				82
			);
		}

		// Draw rank text
		if (this.data.rank.display && !isNaN(this.data.rank.data!)) {
			ctx.font = `bold 36px ${ops.fontX}`;
			ctx.fillStyle = this.data.rank.textColor!;
			ctx.fillText(
				this.data.rank.displayText!,
				800 -
					ctx.measureText(
						(toAbbrev(parseInt(this.data.level.data!.toString())) as string) ||
							"-"
					).width -
					7 -
					ctx.measureText(this.data.level.displayText!.toString()).width -
					7 -
					ctx.measureText(
						(toAbbrev(parseInt(this.data.rank.data!.toString())) as string) ||
							"-"
					).width,
				82
			);

			ctx.font = `bold 32px ${ops.fontX}`;
			ctx.fillStyle = this.data.rank.color!;
			ctx.textAlign = "end";
			ctx.fillText(
				toAbbrev(parseInt(this.data.rank.data!.toString())) as string,
				790 -
					ctx.measureText(
						(toAbbrev(parseInt(this.data.level.data!.toString())) as string) ||
							"-"
					).width -
					7 -
					ctx.measureText(this.data.level.displayText!).width,
				82
			);
		}

		// Show XP text (e.g., "123 / 500")
		ctx.font = `bold 30px ${ops.fontX}`;
		ctx.fillStyle = this.data.requiredXP.color!;
		ctx.textAlign = "start";
		ctx.fillText(
			"/ " + toAbbrev(this.data.requiredXP.data),
			670 +
				ctx.measureText(toAbbrev(this.data.currentXP.data) as string).width +
				15,
			164
		);

		ctx.fillStyle = this.data.currentXP.color!;
		ctx.fillText(toAbbrev(this.data.currentXP.data) as string, 670, 164);

		// Draw progress bar track and fill
		ctx.beginPath();
		if (this.data.progressBar.rounded) {
			// Rounded corners version

			// Draw the track (background)
			ctx.fillStyle = this.data.progressBar.track!.color!;
			ctx.arc(
				257 + 18.5,
				147.5 + 18.5 + 36.25,
				18.5,
				1.5 * Math.PI,
				0.5 * Math.PI,
				true
			);
			ctx.fill();
			ctx.fillRect(257 + 18.5, 147.5 + 36.25, 615 - 18.5, 37.5);
			ctx.arc(
				257 + 615,
				147.5 + 18.5 + 36.25,
				18.75,
				1.5 * Math.PI,
				0.5 * Math.PI,
				false
			);
			ctx.fill();

			// Begin drawing the filled portion
			ctx.beginPath();
			if (this.data.progressBar.bar!.type === "gradient") {
				// Create a radial gradient if type is "gradient".
				let gradientContext = ctx.createRadialGradient(
					this._calculateProgress,
					0,
					500,
					0,
					0,
					0
				);
				if (
					this.data.progressBar.bar!.color &&
					Array.isArray(this.data.progressBar.bar!.color)
				) {
					this.data.progressBar.bar!.color.forEach(
						(color: string, index: number) => {
							gradientContext.addColorStop(index, color);
						}
					);
				}
				ctx.fillStyle = gradientContext;
			} else {
				// If it's a single color
				ctx.fillStyle =
					typeof this.data.progressBar.bar!.color == "string"
						? this.data.progressBar.bar!.color
						: "";
			}

			// Draw the filled portion of the progress bar
			ctx.arc(
				257 + 18.5,
				147.5 + 18.5 + 36.25,
				18.5,
				1.5 * Math.PI,
				0.5 * Math.PI,
				true
			);
			ctx.fill();
			ctx.fillRect(257 + 18.5, 147.5 + 36.25, this._calculateProgress, 37.5);
			ctx.arc(
				257 + 18.5 + this._calculateProgress,
				147.5 + 18.5 + 36.25,
				18.75,
				1.5 * Math.PI,
				0.5 * Math.PI,
				false
			);
			ctx.fill();
		} else {
			// Non-rounded version

			// Draw the fill
			ctx.fillStyle =
				typeof this.data.progressBar.bar!.color == "string"
					? this.data.progressBar.bar!.color
					: "";
			ctx.fillRect(
				this.data.progressBar.x!,
				this.data.progressBar.y!,
				this._calculateProgress!,
				this.data.progressBar.height!
			);

			// Draw an outline to simulate a "track"
			ctx.beginPath();
			ctx.strokeStyle = this.data.progressBar.track!.color!;
			ctx.lineWidth = 7;
			ctx.strokeRect(
				this.data.progressBar.x!,
				this.data.progressBar.y!,
				this.data.progressBar.width!,
				this.data.progressBar.height!
			);
		}

		ctx.save();

		// Draw the clipped circular avatar area
		ctx.beginPath();
		ctx.arc(125 + 10, 125 + 20, 100, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		// Place the avatar inside the circular clip
		ctx.drawImage(
			avatar,
			35,
			45,
			(this.data.avatar.width || 0) + 20,
			(this.data.avatar.height || 0) + 20
		);
		ctx.restore();

		// Draw status indicator
		if (this.data.status.circle) {
			// If circle is true, draw a filled circle
			ctx.beginPath();
			ctx.fillStyle = this.data.status.color!;
			ctx.arc(215, 205, 20, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
		} else if (!this.data.status.circle && this.data.status.width !== 0) {
			// Otherwise, draw a ring
			ctx.beginPath();
			ctx.arc(135, 145, 100, 0, Math.PI * 2, true);
			ctx.strokeStyle = this.data.status.color!;
			ctx.lineWidth = this.data.status.width!;
			ctx.stroke();
		}

		// Return the final image as a Buffer
		return canvas.toBuffer();
	}

	/**
	 * A private getter that calculates the numeric width for the filled portion
	 * of the progress bar based on currentXP, requiredXP, and previousXP.
	 *
	 * @type {number}
	 * @private
	 * @ignore
	 */
	get _calculateProgress(): number {
		const cx = this.data.currentXP.data!;
		const rx = this.data.requiredXP.data!;
		const px = this.data.previousXP.data!;
		const barWidth = this.data.progressBar.width || 0;

		// If required XP is 0 or less, avoid division by zero
		if (rx <= 0) return 1;

		console.log(cx, rx, px);
		// If current XP exceeds the requirement, fill up the bar
		if (cx > rx) return barWidth;

		// Calculate partial progress
		let width = (barWidth * (cx - px)) / (rx - px);
		console.log(width, barWidth);
		if (width > barWidth) {
			width = barWidth;
		}
		return width;
	}
}

/**
 * Shortens a string to a specified length, adding "..." at the end if truncated.
 *
 * @param {string} text - The text to potentially shorten.
 * @param {number} len - The max length of the text before truncation.
 * @returns {string} The shortened text or the original text if it's shorter than `len`.
 */
function shorten(text: string, len: number): string {
	if (typeof text !== "string") return "";
	if (text.length <= len) return text;
	return text.substring(0, len).trim() + "...";
}

/**
 * Converts a large integer into an abbreviated string (e.g., 1200 => "1.2K").
 *
 * @param {any} num - The number to abbreviate.
 * @returns {string} The abbreviated string or "0" if the input is invalid.
 */
function toAbbrev(num: any): string {
	if (!num || isNaN(num)) return "0";
	if (typeof num === "string") num = parseInt(num);
	let decPlaces = Math.pow(10, 1);
	var abbrev = ["K", "M", "B", "T"];
	for (var i = abbrev.length - 1; i >= 0; i--) {
		var size = Math.pow(10, (i + 1) * 3);
		if (size <= num) {
			num = Math.round((num * decPlaces) / size) / decPlaces;
			if (num == 1000 && i < abbrev.length - 1) {
				num = 1;
				i++;
			}
			num += abbrev[i];
			break;
		}
	}
	return num;
}

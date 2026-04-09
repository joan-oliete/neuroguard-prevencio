import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { UserProfile } from '../../../types';

interface NeuroRunnerProps {
    onBack: () => void;
    onComplete: (score: number) => void;
    userProfile?: UserProfile | null;
}

export const NeuroRunnerGame: React.FC<NeuroRunnerProps> = ({ onBack, onComplete, userProfile }) => {
    const gameRef = useRef<HTMLDivElement>(null);
    const gameInstance = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameRef.current) return;

        let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        let obstacles: Phaser.Physics.Arcade.Group;
        let score = 0;
        let scoreText: Phaser.GameObjects.Text;
        let gameOver = false;
        let initialSpeed = 4;
        let speed = initialSpeed;
        let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

        // Data maps (Emoji + Label)
        const BAD_ITEMS = [
            { text: "Ansietat", emoji: "🌪️" },
            { text: "Estrès", emoji: "⚡" },
            { text: "Aïllament", emoji: "🕳️" },
            { text: "Negativitat", emoji: "💩" },
            { text: "Sedentarisme", emoji: "🛋️" },
            { text: "Insomni", emoji: "🧛" },
            { text: "Culpa", emoji: "🥀" },
            { text: "Por", emoji: "👻" },
            { text: "Ira", emoji: "😡" },
            { text: "Recaiguda", emoji: "📉" }
        ];

        const GOOD_ITEMS = [
            { text: "Esport", emoji: "🏃‍♂️" },
            { text: "Descans", emoji: "🛌" },
            { text: "Teràpia", emoji: "🧠" },
            { text: "Amics", emoji: "🤝" },
            { text: "Família", emoji: "👨‍👩‍👧" },
            { text: "Lectura", emoji: "📚" },
            { text: "Meditació", emoji: "🧘" },
            { text: "Natura", emoji: "🌳" },
            { text: "Autoestima", emoji: "🦁" },
            { text: "Calma", emoji: "🕊️" }
        ];

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: "phaser-game-container",
            backgroundColor: '#0f172a',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };

        function preload(this: Phaser.Scene) {
            // Load assets here if needed
        }

        function create(this: Phaser.Scene) {
            // BACKGROUND
            const width = this.scale.width;
            const height = this.scale.height;

            // Draw a futuristic grid
            const grid = this.add.grid(width / 2, height / 2, width, height, 32, 32, 0x0f172a, 1, 0x1e293b, 1);

            // PLAYER - Now using an Emoji Avatar based on user profile or default
            // We use a Container for the player to maybe add a name tag or glow
            const playerContainer = this.add.container(100, height / 2);
            this.physics.add.existing(playerContainer);

            // Emoji Avatar
            const avatarEmoji = userProfile?.avatar?.bodyType === 'feminine' ? '👩‍🚀' : '👨‍🚀';
            const playerVisual = this.add.text(0, 0, avatarEmoji, { fontSize: '40px' }).setOrigin(0.5);

            // Glow effect behind
            const glow = this.add.circle(0, 0, 25, 0x22d3ee, 0.5);

            playerContainer.add([glow, playerVisual]);

            player = playerContainer as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            player.body.setCollideWorldBounds(true);
            player.body.setSize(30, 30); // Hitbox size

            // Player visual effects
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.8, to: 0.3 },
                scale: { from: 1, to: 1.2 },
                duration: 500,
                yoyo: true,
                repeat: -1
            });

            // GROUPS
            obstacles = this.physics.add.group(); // Holds both bad (Red) and good (Green) items

            // INPUT
            if (this.input.keyboard) {
                cursors = this.input.keyboard.createCursorKeys();
            }

            this.input.on('pointerdown', () => {
                if (player.body.velocity.y === 0) {
                    player.body.setVelocityY(-300);
                }
            });

            // SCORING
            scoreText = this.add.text(16, 16, 'XP: 0', { fontSize: '32px', color: '#fff', fontStyle: 'bold' });

            // Name Tag
            this.add.text(16, 50, userProfile ? `Agent ${userProfile.name}` : 'Agent Neural', { fontSize: '18px', color: '#22d3ee' });

            // Spawn Loop
            this.time.addEvent({
                delay: 2000, // Slower spawn rate
                callback: () => {
                    if (gameOver) return;

                    const isGood = Phaser.Math.Between(0, 100) > 60; // 40% chance of good item
                    const y = Phaser.Math.Between(50, height - 100);

                    // Create Container for Emoji + Label
                    const container = this.add.container(width + 50, y);
                    this.physics.add.existing(container);

                    const body = container.body as Phaser.Physics.Arcade.Body;
                    body.setSize(40, 40);

                    // Select item
                    const type = isGood ? 'good' : 'bad';
                    const list = isGood ? GOOD_ITEMS : BAD_ITEMS;
                    const itemData = Phaser.Utils.Array.GetRandom(list);

                    // Visuals: Emoji is BIG, text is small below
                    const emoji = this.add.text(0, 0, itemData.emoji, { fontSize: '48px' }).setOrigin(0.5);
                    const label = this.add.text(0, 40, itemData.text, {
                        fontSize: '16px',
                        color: isGood ? '#4ade80' : '#f43f5e',
                        fontStyle: 'bold',
                        backgroundColor: '#00000080',
                        padding: { x: 4, y: 2 }
                    }).setOrigin(0.5);

                    container.add([emoji, label]);
                    container.setData('type', type);
                    container.setData('name', itemData.text); // For game over message
                    if (isGood) container.setData('points', 50);

                    obstacles.add(container as any);
                },
                loop: true
            });

            // COLLISION
            this.physics.add.overlap(player, obstacles, (p, o) => {
                const item = o as Phaser.GameObjects.Container;
                const type = item.getData('type');

                if (type === 'good') {
                    // Collect Good Item
                    const points = item.getData('points') || 10;
                    score += points;
                    scoreText.setText('XP: ' + score);

                    // Visual feedback
                    this.tweens.add({
                        targets: item,
                        alpha: 0,
                        scale: 1.5,
                        y: item.y - 50,
                        duration: 200,
                        onComplete: () => item.destroy()
                    });

                } else {
                    // Hit Bad Item -> Game Over
                    this.cameras.main.shake(200);
                    gameOver = true;

                    // Stop everything
                    obstacles.setVelocityX(0);

                    const endText = this.add.text(width / 2, height / 2, 'GAME OVER', { fontSize: '64px', color: '#f43f5e', fontStyle: 'black' }).setOrigin(0.5);
                    const itemName = item.getData('name') || 'un obstacle';
                    this.add.text(width / 2, height / 2 + 60, `T'ha atrapat: ${itemName}`, { fontSize: '24px', color: '#fff' }).setOrigin(0.5);

                    setTimeout(() => {
                        onComplete(score);
                    }, 3000);
                }
            });
        }

        function update(this: Phaser.Scene) {
            if (gameOver) return;

            // Player Movement
            if (cursors) {
                if (cursors.up.isDown) {
                    player.body.setVelocityY(-300);
                } else if (cursors.down.isDown) {
                    player.body.setVelocityY(300);
                } else {
                    player.body.setVelocityY(0);
                }
            }

            // Move Items (Obstacles & Collectibles)
            obstacles.getChildren().forEach((child) => {
                const item = child as Phaser.GameObjects.Container;
                const body = item.body as Phaser.Physics.Arcade.Body;

                if (item && body) {
                    item.x -= speed;

                    if (item.x < -100) {
                        item.destroy();
                        if (item.getData('type') === 'bad') {
                            // Only give points for surviving obstacles
                            score += 10;
                            scoreText.setText('XP: ' + score);
                        }
                        speed += 0.05;
                    }
                }
            });
        }

        // Init game
        gameInstance.current = new Phaser.Game(config);

        return () => {
            if (gameInstance.current) {
                gameInstance.current.destroy(true);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4 h-screen">
            <div className="mb-4 w-full max-w-4xl flex justify-between items-center text-white">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Neuro-Runner v0.1</h2>
                <button
                    onClick={onBack}
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold"
                >
                    Sortir
                </button>
            </div>

            <div ref={gameRef} id="phaser-game-container" className="rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-black">
                {/* Phaser mounts here */}
            </div>

            <p className="mt-4 text-slate-500 text-sm">Feu servir les fletxes del teclat (AMUNT/AVALL) per moure.</p>
        </div>
    );
};

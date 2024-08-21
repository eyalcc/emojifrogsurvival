'use client'
/*
* File Name   : frog.tsx
* Author      : Eyal Stern
* Description : Emoji Frog Survival React component
* Created     : 2024-08-21
*/

//import '@/app/ui/global.css';

import { useState, useEffect, useRef } from "react";
//import { KeyboardEvent } from "react";

//menu
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

//modal
import Box from '@mui/material/Box';
//import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';


//menu 2
const options = [
  'Start Over',
  'About',
];
const ITEM_HEIGHT = 48;


export default function Frog() {

	//modal
	const [openModal, setOpenModal] = useState(false);
	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => {
		setOpenModal(false);
		setPause(false);
	}
	
	//menu	
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
	  setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
	  setAnchorEl(null);
	};
	const handleItem = (item:string) => {
	  switch(item){
		case "Start Over" :
			resetGame();
			break;
		case "About":
			handleOpenModal();
			setPause(false);
			break;
	  }
	};
	
	const tileSize = 22;
	const jumpSize = tileSize;
	const xTiles = 15;
	const yTiles = 12;
	const padSpacing = 3;
	const riverLaneStart = 6;
	const riverLaneEnd = 9;
	const tickLength = 100;
	const hitbox = tileSize*.8;
	
	const fieldLength = xTiles*tileSize;
	const fieldHeight = yTiles*tileSize;
	
	var deathTimer = useRef<ReturnType<typeof setInterval>>();
	var deathTimerGraphic2 = useRef<ReturnType<typeof setInterval>>();
	
	const [frogYTile, setFrogYTile] = useState(0);
	const [frogX, setFrogX] = useState(1);
	const [frogY, setFrogY] = useState(1);
	const [frogHit, setFrogHit] = useState(false);
	const [frogDrown, setFrogDrown] = useState(false);
	const [frogLog, setFrogLog] = useState(-1);
	const [tick, setTick] = useState(0);
	const [died, setDied] = useState(false);
	const [diedAt, setDiedAt] = useState<number[]>([]);
	const [won, setWon] = useState(false);
	const [pause, setPause] = useState(false);
	const [addSneakySnake, setAddSneakySnake] = useState(-1);
	const [freezeFrog, setFreezeFrog] = useState(false);
	
	//aliases
	const ts = tileSize;
	const fl = fieldLength;
	const sneakySnakeIndex = 0;
	
	const carData: Array<any> = [
		//sneaky snake - first in list
		{row:99, x:0, speed:0, icon:'🐍', sneakySnake:1},
		
		{row:5, x:0, speed:-8, icon:'🐍'},

		{row:4, x:fl, 	speed:9, 	icon:'🏎️'}, 
		{row:4, x:fl/2, speed:9, 	icon:'🏎️'},
		{row:4, x:fl/3, speed:9, 	icon:'🏎️'},
		
		{row:3, x:fl, 	speed:-2, 	icon:'🚚'},
		{row:3, x:fl/2, speed:-2, 	icon:'🚚'},
		{row:3, x:fl/4, speed:-2, 	icon:'🚚'},
		{row:3, x:fl/9, speed:-2, 	icon:'🚚'}, 
		
		{row:2, x:fl, 	speed:4, 	icon:'🚓'}, 
		{row:2, x:fl/2, speed:4, 	icon:'🚓'},
		
		{row:1, x:fl, 	speed:-7, 	icon:'🚗'}, 
		{row:1, x:fl/2, speed:-7, 	icon:'🚗'},
		{row:1, x:fl/8, speed:-7, 	icon:'🚗'},
		
	]
	const logData: Array<any> = [
		{row:9, x:ts*0, speed:5, 	icon:'🐢'},
		{row:9, x:ts*1, speed:5, 	icon:'🐢'},
		{row:9, x:ts*2, speed:5, 	icon:'🐢'},
		
		{row:9, x:ts*5, speed:5, 	icon:'🪵'},
		{row:9, x:ts*6, speed:5, 	icon:'🪵'},
		{row:9, x:ts*7, speed:5, 	icon:'🪵'},
		
		{row:8, x:0, 	speed:-5, 	icon:'🪵'},
		{row:8, x:ts, 	speed:-5, 	icon:'🪵'},
		{row:8, x:ts*2, speed:-5,  	icon:'🪵'},
		{row:8, x:ts*3, speed:-5, 	icon:'🪵'},
		{row:8, x:ts*4, speed:-5, 	icon:'🪵'},
		
		{row:7, x:0, 	speed:3, 	icon:'🪵'},
		{row:7, x:ts, 	speed:3, 	icon:'🪵'},
		{row:7, x:ts*2, speed:3,  	icon:'🪵'},
		
		{row:7, x:ts*5, speed:3, 	icon:'🐢'},
		{row:7, x:ts*6, speed:3, 	icon:'🐢'},
		{row:7, x:ts*7, speed:3,  	icon:'🐢'},
		
		{row:6, x:ts*1, speed:-4, 	icon:'🐢'},
		{row:6, x:ts*2, speed:-4, 	icon:'🐢'},
		{row:6, x:ts*3, speed:-4, 	icon:'🐢'},
				
		{row:6, x:ts*6, speed:-4, 	icon:'🐢'},
		{row:6, x:ts*7, speed:-4, 	icon:'🐢'},
		{row:6, x:ts*8, speed:-4, 	icon:'🐢'},
		{row:6, x:ts*9, speed:-4, 	icon:'🐢'},
		
	]
	const [cars, setCars] = useState(carData);
	const [logs, setLogs] = useState(logData);
	const [pads, setPads] = useState([0,0,0,0,0]);
	
	const bound = (val: number, min: number, max: number) => {
		return Math.max( min, Math.min(val, max));
	}
	
	//init component
	useEffect(() => {
		initObjectPositions(logs, setLogs);
		initObjectPositions(cars, setCars);
		setAddSneakySnake(getRandomLog());
		handleOpenModal();
		setPause(true);
	}, []);
	
	//interval timer
	useEffect(() => {
		setTimeout(()=>{
			setTick((tick+1)%120);
		}, tickLength);
	},[tick])
	
	const initObjectPositions = (objects:Array<any>, setObj:Function) => {
		var objects2 = [...objects];
		objects2.forEach((object,i)=>{
			object.y = tileSize * object.row as number;
			objects2[i] = object;
		})
		setObj(objects2);
	}
	
	const resetGame = () => {
		resetFrog();
		setPads([0,0,0,0,0]);
		setWon(false);
		setPause(false);
	}
	
	const clickW = () => { goDir('up'	); }
	const clickA = () => { goDir('left'	); }
	const clickS = () => { goDir('down'	); }
	const clickD = () => { goDir('right'); }
	  
	const fieldKeyPress = (e:React.KeyboardEvent<HTMLInputElement>) => {
		const dirs = {
			"KeyW":'up',
			"KeyA":'left',
			"KeyS":'down',
			"KeyD":'right',
		}
		goDir(dirs[e.code as keyof typeof dirs] );
		e.preventDefault();
	}
	
	const goDir = (dir:string) => {
		if(freezeFrog){
			return;
		}
		switch(dir){
			case "left": case "right":
				let xNew = frogX + (dir==='right' ? 1 : -1 )*jumpSize;
				xNew = bound(xNew, 0, fieldLength-tileSize);
				setFrogX(xNew);
				break;
			case "up": case "down":
				let yNew = frogY + (dir==='up' ? 1 : -1 )*tileSize;
				yNew = bound(yNew, 0, fieldHeight-tileSize);
				setFrogY(yNew);
				let yTyileNew = frogYTile + (dir==='up' ? 1 : -1 );
				yTyileNew = bound(yTyileNew, 0, yTiles-1);
				setFrogYTile(yTyileNew);
				break;
		}
	}
	
	const getRandomLog = () => {
		const logIndeces:Array<number> = [];
		logs.forEach((obj,i)=>{
			if(obj.icon === '🪵') {
				logIndeces.push(i);
			}
		})
		return logIndeces[Math.floor(Math.random() * logIndeces.length)];
	}
	
	const moveObjects = (objects:Array<any>, setObjects:Function) => {
		const objects2 = [...objects];
		let addSneakySnakeNow = addSneakySnake > -1;
		objects2.forEach((obj,i)=>{
			let x = obj.x;
			if(!obj.freeze) {
				x+=obj.speed;
			}
			
			const wrappedLeft = (obj.speed < 0 && x<-tileSize);
			const wrappedRight = (obj.speed > 0 && x>fieldLength);
			
			if(wrappedLeft || wrappedRight){
				if(wrappedLeft){
					x = fieldLength;
				} else if(wrappedRight){
					x = -tileSize
				}
			
				//snake
				if(obj.icon === '🐍') {
					obj.freeze = true;
					if(obj.sneakySnake) {
						setTimeout(()=>{
							const randLog = getRandomLog()
							setAddSneakySnake(randLog);
						}, 100)
					} else {
						setTimeout(()=>{
							obj.freeze = false;
						}, 1500)
					}
				}
				
				//snake on a log
				if(addSneakySnakeNow && obj.icon === '🪵' && addSneakySnake === i) {
					addSneakySnakeNow = false;
					setAddSneakySnake(-1);
					cars[sneakySnakeIndex] = {...cars[sneakySnakeIndex], y:obj.y, x:x, speed:obj.speed, row:obj.row, freeze:false} ;
					setCars(cars);
				}
			};
			obj.x = x;
			objects2[i] = obj;
		})
		setObjects(objects2);
	}
	
	const driftFrog = () => {
		if(frogLog> -1){
			let xNew = frogX + logs[frogLog].speed;
			xNew = bound(xNew, 0, fieldLength-tileSize);
			setFrogX(xNew);
		}
	}
	
	const resetFrog = () => {
		setFrogX(0);
		setFrogY(0);
		setFrogYTile(0);
	}
	const die = () => {
		setDied(true);
		setDiedAt([frogX, frogY]);
		resetFrog();
		setFreezeFrog(true)
		clearTimeout(deathTimer.current);
		clearTimeout(deathTimerGraphic2.current);
		
		deathTimer.current = setTimeout(()=>{
			setDied(false);
		}, 5000)
		deathTimerGraphic2.current = setTimeout(()=>{
			setFrogDrown(false);
			setFrogHit(false);
			setFreezeFrog(false);
		}, 2000)
	}
	
	const checkFrogHit = (obj:{x:number, y:number, row:number}) =>{
		if(obj.row === frogYTile && Math.abs(obj.x-frogX) < hitbox) {
			setFrogHit(true);
			die();
		}
	}
	const checkHits = (objects:Array<any>) => {
		objects.forEach((obj,i)=>{
			checkFrogHit(obj);
		})
	}
	
	const checkLogs = () => {
		let setLog = false;
		logs.forEach((log,i)=>{
			if(log.row === frogYTile && Math.abs(log.x-frogX) < hitbox) {
				setFrogLog(i);
				setLog = true;
				return;
			}
		})
		if(!setLog) {
			setFrogLog(-1);
		}
		if(frogYTile >= riverLaneStart && frogYTile <= riverLaneEnd){
			if(!setLog) {
				setFrogDrown(true);
				die();
			}
		}	
	}
	
	const checkPads = () => {
		if(frogYTile === yTiles-2) {
			const frogXTile = Math.round(frogX / tileSize)
			if((frogXTile % padSpacing) === 1) {
				const pads2 = [...pads]
				pads2[(frogXTile-1)/padSpacing] = 1;
				setPads(pads2)
				if(pads2.filter((e)=>{return !e}).length < 1){
					setWon(true);
					setPause(true);
				}
				resetFrog();
			} else {
				die();
			}
		}
	}
	
	//interval timer
	useEffect(()=>{
		if(pause) return;
		moveObjects(cars, setCars);
		moveObjects(logs, setLogs);
		driftFrog();
		checkHits(cars);
		checkLogs();
		checkPads();
	}, [tick, pause])
	
	return (
		<div
			className="relative bg-gray-400 p-3"
			style={{width:(fieldLength + 50) + 'px',}}
			onKeyDown={fieldKeyPress}
			tabIndex={0}
		>
			<div className="justify-center">
				<h1>🐸Emoji Frog Survival🐸
					<div style={{visibility:won ? 'visible':'hidden'}}>💖💖💖 YOU WON! 💖💖💖</div>
				</h1>
			</div>
			
			{/*menu*/}
			<div className="absolute top-0 right-0"> 
			 <IconButton
				aria-label="more"
				id="long-button"
				aria-controls={open ? 'long-menu' : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-haspopup="true"
				onClick={handleClick}
			  >
				<MoreVertIcon />
			  </IconButton>
			  <Menu
				id="long-menu"
				MenuListProps={{
				  'aria-labelledby': 'long-button',
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				PaperProps={{
				  style: {
					maxHeight: ITEM_HEIGHT * 4.5,
					width: '20ch',
				  },
				}}
			  >
				{options.map((option) => (
				  <MenuItem key={option} selected={option === 'Start Over'} onClick={()=>{handleClose();handleItem(option);}}>
					{option}
				  </MenuItem>
				))}
			  </Menu>
			</div>
			
			{/*Modal*/}
			<Modal
			  open={openModal}
			  onClose={handleCloseModal}
			  aria-labelledby="modal-modal-title"
			  aria-describedby="modal-modal-description"
			>
			  <Box sx={{
				position: 'absolute' as 'absolute',
				top: '10%',
				left: '10%',
				width: '80%',
				bgcolor: 'background.paper',
				border: '2px solid #000',
				boxShadow: 24,
				p: 4,
				maxWidth: '400px',
			  }}>
				<Typography id="modal-modal-title" variant="h6" component="h2">
				  🐸Emoji Frog Survival🐸
				</Typography>
				<Typography id="modal-modal-description" sx={{ mt: 2 }}>
					<p className="mb-4">Move your frog to the 5 lily pads without getting run over or drowning. Based on a Midway arcade game.</p>
					<p>Created in ReactJS, without a canvas.</p>
				</Typography>
			  </Box>
			</Modal>
			
			{/*outline to hide wrapped cars*/}
			<div className="absolute bg-transparent outline outline-[20px] outline-gray-700 mt-6"
				style={{
					zIndex: 1,
					left: '22px',
					width:fieldLength + 'px',
					height:fieldHeight + 'px'
				}}
			>
			</div>
			
			{/*main play area*/}
			<div
				style={{
					zIndex: 0,
					left: '10px',
					width:fieldLength + 'px',
					height:fieldHeight + 'px'
				}}
			  className="relative bg-orange-800 mt-6"
			>
				{/*pads*/}
				{pads.map((pad,i)=>(
					<div key={i} className="absolute bg-blue-500" style={{left:ts*((padSpacing*i)+1), top:ts, height:ts, width:ts}}>
						{pad?'🐸':'🌿'}
					</div>
				))}
				
				{/*road*/}
				<div className="absolute bg-gray-500 w-full" style={{bottom:ts*1, height:ts*4}}></div>
				<div className="absolute w-full border border-dashed border-color-white" style={{bottom:ts*2, height:1}}></div>
				<div className="absolute w-full border border-dashed border-color-white" style={{bottom:ts*3, height:1}}></div>
				<div className="absolute w-full border border-dashed border-color-white" style={{bottom:ts*4, height:1}}></div>
				
				{/*river*/}
				<div className="absolute bg-blue-500 w-full" style={{bottom:tileSize*riverLaneStart, height:tileSize*4}}></div>

				{/*logs & turtles*/}	
				{logs.map((log,i) => ( <div key={i} className="absolute" style={{
					left: log.x, bottom: log.y,
					WebkitTransform: (log.icon === '🪵' ? 'rotate(90deg)' : 'none'),
					}}>{log.icon}</div>
				))}
				
				{/*frog and death*/}
				{!!freezeFrog && (tick%2===0) && <div className="absolute" style={{left: frogX, bottom: frogY, WebkitTransform:'scale(1.5, 1.5)'}}>⏹️</div>}
				<div className="absolute" style={{left: frogX, bottom: frogY}} >🐸</div>
				{!!died && (<div className="absolute" style={{left: diedAt[0], bottom: diedAt[1], width:tileSize, height: tileSize}}>
					<div className="absolute">☠️</div>
					{!!frogHit && (<div className="absolute">💥</div>)}
					{!!frogDrown && (<div className="absolute">💦</div>)}
				</div>)}
				
				{/*cars*/}
				{cars.map((car,i) => (
					<div key={i} className="absolute" style={{left: car.x, bottom: car.y,
						WebkitTransform: (car.speed > 0 ? 'scale(-1, 1)' : 'none'),
					}}>{car.icon}</div>
				))}
			
			</div>
			
			{/*controls*/}
			<div className="mt-6 ml-6 h-fit w-[300px] gap-2 content-start bg-gray-500 \
				grid grid-cols-3 border-4 border-black p-2 \
				[&>*]:bg-gray-200 [&>*]:h-12 [&>*]:justify-center \
				[&>*]:flex [&>*]:items-center [&>*]:rounded \
			">
				<div onClick={clickW} className="border-red-400 border-t-4 col-span-3">W</div>
				<div onClick={clickA} className="border-red-400 border-l-4 ">A</div>
				<div onClick={clickS} className="border-red-400 border-b-4 ">S</div>
				<div onClick={clickD} className="border-red-400 border-r-4 ">D</div>
			</div>
		</div>
	);

}


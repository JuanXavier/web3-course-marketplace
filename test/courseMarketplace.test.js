const CourseMarketplace = artifacts.require('CourseMarketplace');
const {catchRevert} = require('./utils/exceptions');

/*---------------------Helpers--------------------------*/

const getBalance = async (address) => web3.eth.getBalance(address);
const toBN = (value) => web3.utils.toBN(value);

const getGas = async (result) => {
	const tx = await web3.eth.getTransaction(result.tx);
	const gasUsed = toBN(result.receipt.gasUsed);
	const gasPrice = toBN(tx.gasPrice);
	const gas = gasUsed.mul(gasPrice);
	return gas;
};

/*---------------------Testing--------------------------*/

contract('CourseMarketplace', (accounts) => {
	const courseId = '0x00000000000000000000000000003130';
	const proof = '0x0000000000000000000000000000313000000000000000000000000000003130';

	const courseId2 = '0x00000000000000000000000000002130';
	const proof2 = '0x0000000000000000000000000000213000000000000000000000000000002130';

	const value = '900000000';

	let _contract = null;
	let contractOwner = null;
	let buyer = null;
	let courseHash = null;

	/*------------------Deploy and get accounts------------------*/

	before(async () => {
		_contract = await CourseMarketplace.deployed();
		contractOwner = accounts[0];
		buyer = accounts[1];
	});

	/*------------------------Purchase---------------------------*/

	describe('Purchase the new course', () => {
		before(async () => {
			await _contract.purchaseCourse(courseId, proof, {
				from: buyer,
				value: value,
			});
		});

		it('Sould not allow to repurchase course an already owned course', async () => {
			await catchRevert(
				_contract.purchaseCourse(courseId, proof, {
					from: buyer,
					value: value,
				})
			);
		});

		it('Can get the purchased course hash by index', async () => {
			const index = 0;
			courseHash = await _contract.getCourseHashAtIndex(index);
			const expectedHash = web3.utils.soliditySha3(
				{
					type: 'bytes16',
					value: courseId,
				},
				{
					type: 'address',
					value: buyer,
				}
			);

			assert.equal(
				courseHash,
				expectedHash,
				'Course hash is not matching the hash of purchased course!!!!'
			);
		});

		it('Should match the data of the course purchased by buyer', async () => {
			const expectedIndex = 0;
			const expectedState = 0;
			const course = await _contract.getCourseByHash(courseHash);

			assert.equal(course.id, expectedIndex, 'Course index should be 0');
			assert.equal(course.price, value, `Course price should be ${value}`);
			assert.equal(course.proof, proof, `Course proof should be ${proof}`);
			assert.equal(course.owner, buyer, `Course proof should be ${buyer}`);
			assert.equal(
				course.state,
				expectedState,
				`Course proof should be ${expectedState}`
			);
		});

		console.log('CONTRACT BALANCE: ', await getBalance(_contract.address));
	});

	/*------------------------Activate---------------------------*/

	describe('Activate the purchased course', () => {
		it('Should NOT be able to activate by anyone who is NOT the contract owner', async () => {
			await catchRevert(_contract.activateCourse(courseHash, {from: buyer}));
		});

		it('Should have a status of ACTIVATED', async () => {
			await _contract.activateCourse(courseHash, {from: contractOwner});
			const course = await _contract.getCourseByHash(courseHash);
			const expectedState = 1;

			assert.equal(course.state, expectedState, 'Course should be ACTIVATED');
		});
	});

	/*-------------------Transfer ownership----------------------*/

	describe('Transfer ownership', () => {
		let currentOwner = null;

		before(async () => {
			currentOwner = await _contract.getContractOwner();
		});

		it('getContractOwner should return the deployer address', () => {
			assert.equal(
				contractOwner,
				currentOwner,
				'contractOwner is not maching the one from "getContractOwner()"'
			);
		});

		it('Should NOT transfer ownership when NOT owner is sending transaction', async () => {
			await catchRevert(_contract.transferOwnership(accounts[3], {from: accounts[4]}));
		});

		it('Should transfer ownership to 3rd address from accounts', async () => {
			await _contract.transferOwnership(accounts[2], {from: currentOwner});
			const owner = (currentOwner = await _contract.getContractOwner());
			assert.equal(owner, accounts[2], 'Contract owner is not accounts[2]');
		});

		it('Should transfer ownership back to initial contract owner', async () => {
			await _contract.transferOwnership(contractOwner, {from: accounts[2]});
			const owner = (currentOwner = await _contract.getContractOwner());
			assert.equal(owner, contractOwner, 'Contract owner is not set');
		});
	});

	/*---------------------Deactivate----------------------------*/

	describe('Deactivate course', () => {
		let courseHash2 = null;
		let currentOwner = null;

		before(async () => {
			await _contract.purchaseCourse(courseId2, proof2, {from: buyer, value});
			courseHash2 = await _contract.getCourseHashAtIndex(1);
			currentOwner = await _contract.getContractOwner();
		});

		it('should NOT be able to deactivate the course by NOT contract owner', async () => {
			await catchRevert(_contract.deactivateCourse(courseHash2, {from: buyer}));
		});

		it('should have status of "Deactivated" and price 0', async () => {
			const beforeTxBuyerBalance = await getBalance(buyer);
			const beforeTxContractBalance = await getBalance(_contract.address);
			const beforeTxOwnerBalance = await getBalance(currentOwner);

			const result = await _contract.deactivateCourse(courseHash2, {
				from: contractOwner,
			});

			const afterTxBuyerBalance = await getBalance(buyer);
			const afterTxContractBalance = await getBalance(_contract.address);
			const afterTxOwnerBalance = await getBalance(currentOwner);

			const course = await _contract.getCourseByHash(courseHash2);
			const expectedState = 2;
			const expectedPrice = 0;
			const gas = await getGas(result);

			assert.equal(course.state, expectedState, 'Course is NOT deactivated!');
			assert.equal(course.price, expectedPrice, 'Course price is not 0!');

			assert.equal(
				toBN(beforeTxOwnerBalance).sub(gas).toString(),
				afterTxOwnerBalance,
				'Owner balance is not correct'
			);

			assert.equal(
				toBN(beforeTxBuyerBalance).add(toBN(value)).toString(),
				afterTxBuyerBalance,
				'Buyer balance is not correct'
			);

			assert.equal(
				toBN(beforeTxContractBalance).sub(toBN(value)).toString(),
				afterTxContractBalance,
				'Contract balance is not correct'
			);
		});

		it('should NOT be able activate deactivated course', async () => {
			await catchRevert(_contract.activateCourse(courseHash2, {from: contractOwner}));
		});
	});

	/*---------------------Repurchase----------------------------*/

	describe('Repurchase course', () => {
		let courseHash2 = null;

		before(async () => {
			courseHash2 = await _contract.getCourseHashAtIndex(1);
		});

		it("should NOT repurchase when the course doesn't exist", async () => {
			const notExistingHash =
				'0x5ceb3f8075c3dbb5d490c8d1e6c950302ed065e1a9031750ad2c6513069e3fc3';

			await catchRevert(_contract.repurchaseCourse(notExistingHash, {from: buyer}));
		});

		it('should NOT repurchase with NOT course owner', async () => {
			const notOwnerAddress = accounts[2];
			await catchRevert(_contract.repurchaseCourse(courseHash2, {from: notOwnerAddress}));
		});

		it('should be able repurchase with the original buyer', async () => {
			const beforeTxBuyerBalance = await getBalance(buyer);
			const beforeTxContractBalance = await getBalance(_contract.address);

			const result = await _contract.repurchaseCourse(courseHash2, {
				from: buyer,
				value,
			});

			const afterTxBuyerBalance = await getBalance(buyer);
			const afterTxContractBalance = await getBalance(_contract.address);

			const course = await _contract.getCourseByHash(courseHash2);
			const expectedState = 0;
			const gas = await getGas(result);

			assert.equal(course.state, expectedState, 'The course is not in purchased state');
			assert.equal(course.price, value, `The course price is not equal to ${value}`);

			assert.equal(
				toBN(beforeTxBuyerBalance).sub(toBN(value)).sub(gas).toString(),
				afterTxBuyerBalance,
				'Client balance is not correct after repurchasing!'
			);

			assert.equal(
				toBN(beforeTxContractBalance).add(toBN(value)).toString(),
				afterTxContractBalance,
				'Contract balance is not correct after repurchasing!'
			);
		});

		it('should NOT be able to repurchase purchased course', async () => {
			await catchRevert(_contract.repurchaseCourse(courseHash2, {from: buyer}));
		});
	});

	/*---------------------Receive funds-------------------------*/

	describe('Receive funds', () => {
		it('Should have transacted funds', async () => {
			const value = '100000000000000000';
			const contractBeforeTx = await getBalance(_contract.address);

			await web3.eth.sendTransaction({
				from: buyer,
				to: _contract.address,
				value,
			});

			const contractAfterTx = await getBalance(_contract.address);

			assert.equal(
				toBN(contractBeforeTx).add(toBN(value)).toString(),
				contractAfterTx,
				'Value After TX is NOT matching'
			);
		});
	});

	/*---------------------Withdraw funds-------------------------*/

	describe('Normal withdraw', () => {
		const fundsToDeposit = '100000000000000000';
		const overLimitFunds = '999999000000000000000';
		let currentOwner = null;

		before(async () => {
			currentOwner = await _contract.getContractOwner();

			await web3.eth.sendTransaction({
				from: buyer,
				to: _contract.address,
				value: fundsToDeposit,
			});
		});

		it('Should fail when NOT owner tries to withdraw', async () => {
			const value = '10000000';
			await catchRevert(_contract.withdraw(value, {from: buyer}));
		});

		it('Should fail when withdrawing overlimit funds', async () => {
			await catchRevert(_contract.withdraw(overLimitFunds, {from: contractOwner}));
		});

		it('Should have plus 0,1 Eth after withdraw', async () => {
			const ownerBalance = await getBalance(currentOwner);

			const result = await _contract.withdraw(fundsToDeposit, {
				from: currentOwner,
			});

			const newOwnerBalance = await getBalance(currentOwner);
			const gas = await getGas(result);

			assert.equal(
				toBN(ownerBalance).add(toBN(fundsToDeposit)).sub(gas).toString(),
				newOwnerBalance,
				'Owner balance after TX is NOT correct'
			);
		});
	});

	/*--------------Emergency withdraw funds----------------------*/

	describe('Emergency withdraw', () => {
		let currentOwner;

		before(async () => {
			currentOwner = await _contract.getContractOwner();
		});

		it('should fail when contract is not stopped', async () => {
			await catchRevert(_contract.emergencyWithdraw({from: currentOwner}));
		});

		it('Should have all contract funds on contractOwner', async () => {
			await _contract.stopContract({from: contractOwner});

			const contractBalance = await getBalance(_contract.address);
			const ownerBalance = await getBalance(currentOwner);
			const result = await _contract.emergencyWithdraw({from: currentOwner});
			const newOwnerBalance = await getBalance(currentOwner);
			const gas = await getGas(result);

			assert.equal(
				toBN(ownerBalance).add(toBN(contractBalance)).sub(gas).toString(),
				newOwnerBalance,
				'Owner doesnt have contract balance'
			);
		});

		it('Should have contract balance of zero', async () => {
			const contractBalance = await getBalance(_contract.address);
			assert.equal(contractBalance, 0, 'Contract balance doesnt have zero balance');
		});

		after(async () => {
			await _contract.resumeContract({from: currentOwner});
		});
	});

	/*--------------------Self destruct---------------------------*/

	describe('Self destruct', () => {
		let currentOwner;

		before(async () => {
			currentOwner = await _contract.getContractOwner();
		});

		it('should fail when contract is not stopped', async () => {
			await catchRevert(_contract.selfDestruct({from: currentOwner}));
		});

		it('Should have all contract funds on contractOwner', async () => {
			await _contract.stopContract({from: contractOwner});

			const contractBalance = await getBalance(_contract.address);
			const ownerBalance = await getBalance(currentOwner);
			const result = await _contract.selfDestruct({from: currentOwner});
			const newOwnerBalance = await getBalance(currentOwner);
			const gas = await getGas(result);

			assert.equal(
				toBN(ownerBalance).add(toBN(contractBalance)).sub(gas).toString(),
				newOwnerBalance,
				'Owner doesnt have contract balance'
			);
		});

		it('Should have contract balance of zero', async () => {
			const contractBalance = await getBalance(_contract.address);
			assert.equal(contractBalance, 0, 'Contract balance doesnt have zero balance');
		});

		it('Should have 0x bytecode', async () => {
			const code = await web3.eth.getCode(_contract.address);
			assert.equal(code, '0x', 'Contract is not destroyed');
		});
	});
});

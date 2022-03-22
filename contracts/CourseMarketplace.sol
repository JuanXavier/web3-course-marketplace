// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/*
	TODO:
	- Check for totalOwnedCourses. It should be called totalSoldCourses since it does not
	take into consideration the msg.sender executing the function
	-
*/


contract CourseMarketplace {
	enum State {
		Purchased, 
		Activated, 
		Deactivated
	}

	struct Course {
		uint256 id;
		uint256 price;
		bytes32 proof;
		address owner;
		State state;
	}

	bool public isStopped = false;

	// Mapping of course data accessed with courseHash
	mapping(bytes32 => Course) private ownedCourses;

	// Mapping of course hash accessed with course id
	mapping(uint256 => bytes32) private ownedCourseHash;

	uint256 private totalOwnedCourses;
	address payable private owner;

	constructor() {
		setContractOwner(msg.sender);
	} 

	/*---------------------Modifiers---------------------------*/

	modifier onlyOwner() {
		if (msg.sender != getContractOwner()) {
			revert ("Only contract owner has access to this functionality.");
		}
		_;
	}
	
	modifier onlyWhenNotStopped() {
		require(!isStopped);
		_;
	}

	modifier onlyWhenStopped() {
		require(isStopped);
		_;
	}

	/*-----------Stopping/resuming/killing contract-------------*/

	function selfDestruct() external onlyWhenStopped onlyOwner {
		selfdestruct(owner);
	}

	function stopContract() external onlyOwner {
		isStopped = true;
	}

	function resumeContract() external onlyOwner {
		isStopped = false;
	}

	receive() external payable {}

	/*---------------------Withdrawals----------------------------*/

	function withdraw(uint256 amount) external onlyOwner {
		(bool success, ) = owner.call{value: amount}("");
		require(success, "Transfer failed");
	}

	function emergencyWithdraw() external onlyWhenStopped onlyOwner {
		(bool success, ) = owner.call{value: address(this).balance}("");
		require(success, "Transfer failed");
	}
	
	/*-----------------------Purchase-----------------------------*/

	function purchaseCourse(bytes16 courseId, bytes32 proof) external payable onlyWhenNotStopped {
		// Create course hash with its id and the buyer's address
		bytes32 courseHash = keccak256(abi.encodePacked(courseId, msg.sender));

		// CHeck if owner has bought the course before
		if (hasCourseOwnership(courseHash)) {
			revert("You are already the owner of this course");
		}

		// Increment owned courses
		uint256 id = totalOwnedCourses++;

		// Assign the course hash to the course id in mapping
		ownedCourseHash[id] = courseHash;

		// Update course data in mapping
		ownedCourses[courseHash] = Course({
			id: id,
			price: msg.value,
			proof: proof,
			owner: msg.sender,
			state: State.Purchased
		});
	}

	/*-----------------------Repurchase-----------------------------*/

	function repurchaseCourse(bytes32 courseHash) external payable onlyWhenNotStopped {
		if (!isCourseCreated(courseHash)) {
			revert ("Course is not created");
		}
	
		if(!hasCourseOwnership(courseHash)) {
			revert ("Sender is not the course owner");
		}

		Course storage course = ownedCourses[courseHash];

		if (course.state != State.Deactivated) {
			revert ("Course is not purchased");
		}

		course.state = State.Purchased;
		course.price = msg.value;
	}

	/*------------------------Activate-------------------------------*/

	function activateCourse(bytes32 courseHash) external onlyWhenNotStopped onlyOwner {
		if(!isCourseCreated(courseHash)) {
			revert ("Course is not created");

		}

		Course storage course = ownedCourses[courseHash];

		if(course.state != State.Purchased) {
			revert ("Course is not purchased");
		}

		course.state = State.Activated;
	}

	/*----------------------Deactivate------------------------------*/

	function deactivateCourse(bytes32 courseHash) external onlyWhenNotStopped onlyOwner {
		if(!isCourseCreated(courseHash)) {
			revert ("Course is not created");
		}
	
		Course storage course = ownedCourses[courseHash];

		if(course.state != State.Purchased) {
			revert ("Course is not purchased");
		}

		(bool success, ) = course.owner.call{value: course.price}("");
		require (success, "Transfer failed");
		
		course.state = State.Deactivated;
		course.price = 0;
	}

	/*----------------Course information---------------------*/

	function getCourseCount() external view returns(uint256) {
		return totalOwnedCourses;
	}

	function getCourseHashAtIndex(uint256 index) external view returns(bytes32) {
		return ownedCourseHash[index];
	}

	function getCourseByHash(bytes32 courseHash) external view returns(Course memory) {
		return ownedCourses[courseHash];
	}

	/*---------------------Ownership-------------------------*/

	function getContractOwner() public view returns(address) {
		return owner;
	}

	function setContractOwner(address newOwner) private {
		owner = payable(newOwner);
	}

	function transferOwnership(address newOwner) external onlyOwner {	
		setContractOwner(newOwner);
	}

	/*-----------------Verification helpers-------------------*/

	function isCourseCreated(bytes32 courseHash) private view returns(bool) {
		return ownedCourses[courseHash].owner != 0x0000000000000000000000000000000000000000;
	}

	function hasCourseOwnership(bytes32 courseHash) private view returns(bool) {
		return ownedCourses[courseHash].owner == msg.sender;
	}
}
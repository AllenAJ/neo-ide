import React, { useState } from 'react';
import { Code2, FileCode, Users, Box, Coins } from 'lucide-react';

interface Template {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  code: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ContractTemplatesProps {
  onSelectTemplate: (code: string) => void;
}

const ContractTemplates: React.FC<ContractTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates: Template[] = [
    {
      id: 'erc20',
      category: 'tokens',
      name: 'ERC-20 Token',
      description: 'Standard fungible token implementation',
      icon: <Coins className="w-5 h-5" />,
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
}`
    },
    {
      id: 'nft',
      category: 'tokens',
      name: 'NFT Collection',
      description: 'Basic NFT collection with minting functionality',
      icon: <Box className="w-5 h-5" />,
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleNFT {
    string public name;
    string public symbol;
    uint256 private _tokenIds;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    function mint() public returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _owners[newTokenId] = msg.sender;
        _balances[msg.sender]++;
        emit Transfer(address(0), msg.sender, newTokenId);
        return newTokenId;
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token doesn't exist");
        return owner;
    }
    
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }
}`
    },
    {
      id: 'multisig',
      category: 'security',
      name: 'Multi-Signature Wallet',
      description: 'Wallet requiring multiple signatures for transactions',
      icon: <Users className="w-5 h-5" />,
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MultiSigWallet {
    address[] public owners;
    uint public required;
    uint public transactionCount;
    
    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
    }
    
    mapping(uint => Transaction) public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;
    
    event Submission(uint indexed transactionId);
    event Confirmation(address indexed sender, uint indexed transactionId);
    event Execution(uint indexed transactionId);
    
    constructor(address[] memory _owners, uint _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required number");
        owners = _owners;
        required = _required;
    }
    
    function submitTransaction(address _to, uint _value, bytes memory _data) public returns (uint) {
        uint transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false
        });
        transactionCount += 1;
        emit Submission(transactionId);
        return transactionId;
    }
    
    function confirmTransaction(uint transactionId) public {
        require(isOwner(msg.sender), "Not owner");
        require(!confirmations[transactionId][msg.sender], "Already confirmed");
        confirmations[transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }
    
    function executeTransaction(uint transactionId) public {
        require(!transactions[transactionId].executed, "Already executed");
        if (isConfirmed(transactionId)) {
            Transaction storage transaction = transactions[transactionId];
            transaction.executed = true;
            (bool success,) = transaction.to.call{value: transaction.value}(transaction.data);
            require(success, "Execution failed");
            emit Execution(transactionId);
        }
    }
    
    function isOwner(address addr) private view returns (bool) {
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == addr) return true;
        }
        return false;
    }
    
    function isConfirmed(uint transactionId) public view returns (bool) {
        uint count = 0;
        for (uint i = 0; i < owners.length; i++) {
            if (confirmations[transactionId][owners[i]]) count += 1;
            if (count == required) return true;
        }
        return false;
    }
}`
    }
  ];

  const categories: Category[] = [
    { id: 'all', name: 'All Templates', icon: <FileCode className="w-4 h-4" /> },
    { id: 'tokens', name: 'Tokens', icon: <Coins className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <Users className="w-4 h-4" /> }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-white mb-4">Contract Templates</h2>
      
      {/* Category Pills */}
      <div className="flex gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              selectedCategory === category.id
                ? 'bg-[#00ff98] text-black'
                : 'bg-[#1e2124] text-gray-300 hover:bg-[#2a2d31]'
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div 
            key={template.id} 
            className="bg-[#1e2124] rounded-lg p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[#00ff98]">{template.icon}</div>
              <div>
                <h3 className="text-white font-medium">{template.name}</h3>
                <p className="text-sm text-gray-400">{template.description}</p>
              </div>
            </div>
            
            <button
              onClick={() => onSelectTemplate(template.code)}
              className="mt-auto w-full px-4 py-2 bg-transparent text-[#00ff98] border border-[#00ff98] rounded-lg hover:bg-[#00ff98] hover:text-black transition-colors text-sm font-medium"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractTemplates;
import { Provider, Signer, Wallet, Contract } from 'ethers';
import * as _zama_fhe_relayer_sdk_web from '@zama-fhe/relayer-sdk/web';
export { SepoliaConfig, initSDK } from '@zama-fhe/relayer-sdk/web';

/**
 * Type definitions for Zama Private Message SDK
 */

/**
 * SDK configuration options
 */
interface MsgSDKConfig {
    /** Contract address on Sepolia */
    contractAddress?: string;
    /** RPC URL */
    rpcUrl?: string;
    /** Provider instance (if already initialized) */
    provider?: Provider;
    /** Signer instance (if already initialized) */
    signer?: Signer;
}
/**
 * Message structure
 */
interface Message {
    /** Message content (decrypted) */
    content: string;
    /** Encrypted content (from blockchain) */
    encryptedContent: string;
    /** Timestamp */
    timestamp: number;
    /** Sender address */
    from: string;
    /** Recipient address */
    to: string;
}
/**
 * Encrypted message from blockchain
 */
interface EncryptedMessage {
    /** Sender address */
    from: string;
    /** Recipient address */
    to: string;
    /** Encrypted message content */
    msgContent: string;
    /** Timestamp */
    time: number;
}
/**
 * Dialogue structure
 */
interface Dialogue {
    /** Dialogue address (unique identifier) */
    dialogueAddress: string;
    /** Participants in the dialogue */
    participants: string[];
    /** The other user in this dialogue (not the current user) */
    otherUser?: string;
    /** Number of messages */
    messageCount: number;
    /** Last message (if available) */
    lastMessage?: Message;
    /** FHE encrypted dialogue private key */
    encryptedPrivateKey: string;
}
/**
 * Generated password wallet
 */
interface PasswordWallet {
    /** Private key */
    privateKey: string;
    /** Wallet address */
    address: string;
    /** Full wallet instance */
    wallet: Wallet;
}
/**
 * Register result
 */
interface RegisterResult {
    /** Transaction hash */
    transactionHash: string;
    /** Password address */
    passwordAddress: string;
    /** Block number */
    blockNumber?: number;
}
/**
 * Send message parameters
 */
interface SendMessageParams {
    /** Recipient address */
    to: string;
    /** Message content (plaintext) */
    message: string;
    /** Password for deriving password wallet */
    password: string;
    /** Optional: dialogue key for existing conversations */
    dialogueKey?: bigint;
}
/**
 * Send message result
 */
interface SendMessageResult {
    /** Transaction hash */
    transactionHash: string;
    /** Dialogue address */
    dialogueAddress: string;
    /** Block number */
    blockNumber?: number;
}
/**
 * Get messages parameters
 */
interface GetMessagesParams {
    /** Dialogue address */
    dialogueAddress: string;
    /** Password for decryption */
    password: string;
}
/**
 * Get dialogue with user parameters
 */
interface GetDialogueWithParams {
    /** Other user address */
    otherUser: string;
    /** Password for decryption */
    password: string;
}
/**
 * Get dialogue with user result
 */
interface GetDialogueWithResult {
    /** Dialogue address */
    dialogueAddress: string;
    /** Messages in the dialogue */
    messages: Message[];
}
/**
 * Message list from contract
 */
interface MSGList {
    /** FHE encrypted private key */
    privateKey: string;
    /** Dialogue address */
    dialogueAddress: string;
    /** Sender address (one of the participants) */
    from: string;
    /** Recipient address (the other participant) */
    to: string;
    /** List of messages */
    msgList: EncryptedMessage[];
}
/**
 * Event unsubscribe function
 */
type EventUnsubscribe = () => void;
/**
 * Event callbacks for SDK operations
 */
interface MsgSDKEventCallbacks {
    /** Called when transaction is submitted */
    onTransactionSubmitted?: (txHash: string) => void;
    /** Called when transaction is confirmed */
    onTransactionConfirmed?: (receipt: any) => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Called when new message is received */
    onNewMessage?: (message: Message) => void;
}
/**
 * Error codes
 */
declare enum ErrorCode {
    NOT_REGISTERED = "NOT_REGISTERED",
    INVALID_PASSWORD = "INVALID_PASSWORD",
    DECRYPTION_FAILED = "DECRYPTION_FAILED",
    DIALOGUE_NOT_FOUND = "DIALOGUE_NOT_FOUND",
    TRANSACTION_FAILED = "TRANSACTION_FAILED",
    INSUFFICIENT_GAS = "INSUFFICIENT_GAS",
    SDK_NOT_INITIALIZED = "SDK_NOT_INITIALIZED"
}
/**
 * Custom error class
 */
declare class PrivateMsgError extends Error {
    code: ErrorCode;
    details?: any | undefined;
    constructor(code: ErrorCode, message: string, details?: any | undefined);
}

/**
 * Authentication Module
 * Handles user registration, password wallet generation, and verification
 */

declare class AuthModule {
    contract: Contract | null;
    signerAddress: string | null;
    /**
     * Initialize the auth module
     * @param contract Contract instance
     * @param signerAddress Current signer address
     */
    initialize(contract: any, signerAddress: string): void;
    /**
     * Generate password wallet from user address and password
     * @param userAddress User's wallet address
     * @param password User's password
     * @returns Password wallet information
     */
    generatePasswordWallet(userAddress: string, password: string): PasswordWallet;
    /**
     * Register user (store password address on-chain)
     * @param password User's password
     * @returns Registration result
     */
    register(password: string): Promise<RegisterResult>;
    /**
     * Check if user is registered
     * @param userAddress User's wallet address
     * @returns True if registered, false otherwise
     */
    isRegistered(userAddress: string): Promise<boolean>;
    /**
     * Get password address for a user
     * @param userAddress User's wallet address
     * @returns Password address or null if not registered
     */
    getPasswordAddress(userAddress: string): Promise<string | null>;
    /**
     * Verify password by comparing derived address with stored address
     * @param userAddress User's wallet address
     * @param password Password to verify
     * @returns True if password is correct, false otherwise
     */
    verifyPassword(userAddress: string, password: string): Promise<boolean>;
}

/**
 * Key Manager Module
 * Handles dialogue key generation, encryption, decryption, and caching
 */

declare class KeyManager {
    keyCache: Map<string, bigint>;
    cacheTTL: number;
    fheInstance: any;
    contractAddress: string;
    /**
     * Initialize the key manager
     * @param fheInstance FHE instance from @zama-fhe/relayer-sdk
     * @param contractAddress Contract address
     */
    initialize(fheInstance: any, contractAddress: string): void;
    /**
     * Generate a random dialogue private key
     * @returns Random bigint key
     */
    generateDialogueKey(): bigint;
    /**
     * Calculate dialogue address from two user addresses
     * This must match the contract's getMsgID function exactly
     * @param address1 First user address
     * @param address2 Second user address
     * @returns Dialogue address
     */
    getDialogueAddress(address1: string, address2: string): string;
    /**
     * FHE encrypt dialogue private key
     * @param key Dialogue private key (bigint)
     * @param userAddress User address for encryption
     * @returns Encrypted input object with handles and proof
     */
    encryptDialogueKey(key: bigint, userAddress: string): Promise<{
        handles: string[];
        inputProof: string;
    }>;
    /**
     * FHE decrypt dialogue private key
     * @param encryptedKeyHandle FHE encrypted key handle (from blockchain)
     * @param passwordWallet Password wallet for decryption authorization
     * @returns Decrypted dialogue private key
     */
    decryptDialogueKey(encryptedKeyHandle: string, passwordWallet: Wallet): Promise<bigint>;
    /**
     * Cache a decrypted dialogue key
     * @param dialogueAddress Dialogue address
     * @param key Dialogue private key
     */
    cacheDialogueKey(dialogueAddress: string, key: bigint): void;
    /**
     * Get cached dialogue key
     * @param dialogueAddress Dialogue address
     * @returns Cached key or null if not found
     */
    getCachedDialogueKey(dialogueAddress: string): bigint | null;
    /**
     * Clear all cached keys
     */
    clearCache(): void;
    /**
     * Set cache TTL
     * @param ttl Time to live in milliseconds
     */
    setCacheTTL(ttl: number): void;
}

/**
 * Encryption Module
 * Handles message encryption and decryption using AES-256-CBC from crypto-js
 */

declare class EncryptionModule {
    /**
     * Encrypt message using AES-256-CBC from crypto-js
     * @param message Plaintext message
     * @param key Encryption key (bigint from dialogue private key)
     * @returns Encrypted message (hex string with 0x prefix)
     */
    encryptMessage(message: string, key: bigint): Promise<string>;
    /**
     * Decrypt message using AES-256-CBC from crypto-js
     * @param encryptedMessage Encrypted message (hex string with 0x prefix)
     * @param key Decryption key (bigint from dialogue private key)
     * @returns Decrypted plaintext message
     */
    decryptMessage(encryptedMessage: string, key: bigint): Promise<string>;
    /**
     * Batch decrypt messages
     * @param messages Array of encrypted messages
     * @param key Decryption key
     * @returns Array of decrypted messages
     */
    decryptMessages(messages: EncryptedMessage[], key: bigint): Promise<Message[]>;
}

/**
 * Message Module
 * Handles message sending, retrieval, and event listening
 */

declare class MessageModule {
    contract: Contract | null;
    keyManager: KeyManager;
    encryption: EncryptionModule;
    auth: AuthModule;
    signerAddress: string | null;
    callbacks: MsgSDKEventCallbacks;
    constructor(keyManager: KeyManager, encryption: EncryptionModule, auth: AuthModule);
    /**
     * Initialize the message module
     * @param contract Contract instance
     * @param signerAddress Current signer address
     */
    initialize(contract: Contract, signerAddress: string): void;
    /**
     * Set event callbacks
     * @param callbacks Event callback functions
     */
    setCallbacks(callbacks: MsgSDKEventCallbacks): void;
    /**
     * Send a message to another user
     * @param params Send message parameters
     * @returns Send message result
     */
    sendMessage(params: SendMessageParams): Promise<SendMessageResult>;
    /**
     * Get all dialogues for a user
     * @param userAddress User's wallet address
     * @returns Array of dialogues
     */
    getDialogues(userAddress: string): Promise<Dialogue[]>;
    /**
     * Get messages from a specific dialogue
     * @param params Get messages parameters
     * @returns Array of decrypted messages
     */
    getMessages(params: GetMessagesParams): Promise<Message[]>;
    /**
     * Get dialogue and messages with a specific user
     * @param params Get dialogue with user parameters
     * @returns Dialogue address and messages
     */
    getDialogueWith(params: GetDialogueWithParams): Promise<GetDialogueWithResult>;
    /**
     * Listen for new message events
     * Note: This requires contract events to be properly defined
     * @param callback Callback function for new messages
     * @returns Unsubscribe function
     */
    onNewMessage(callback: (message: Message) => void): EventUnsubscribe;
}

/**
 * Dialogue Module
 * Handles dialogue information retrieval and management
 */

declare class DialogueModule {
    contract: Contract | null;
    /**
     * Initialize the dialogue module
     * @param contract Contract instance
     */
    initialize(contract: Contract): void;
    /**
     * Get dialogue information
     * @param dialogueAddress Dialogue address
     * @returns Dialogue information
     */
    getDialogue(dialogueAddress: string): Promise<Dialogue>;
    /**
     * List all dialogues for a user
     * @param userAddress User's wallet address
     * @returns Array of dialogue addresses
     */
    listUserDialogues(userAddress: string): Promise<string[]>;
    /**
     * Get participants in a dialogue
     * Note: The contract doesn't store participant information explicitly
     * This would need to be derived from transaction history or events
     * @param dialogueAddress Dialogue address
     * @returns Array of participant addresses (empty for now)
     */
    getParticipants(dialogueAddress: string): Promise<string[]>;
    /**
     * Get dialogue address between two users
     * This calls the contract's getMsgID function
     * @param user1 First user address
     * @param user2 Second user address
     * @returns Dialogue address
     */
    getDialogueAddressBetween(user1: string, user2: string): Promise<string>;
}

/**
 * Main SDK class for Zama Private Message
 */
declare class PrivateMsgSDK {
    config: Required<MsgSDKConfig>;
    contract: Contract | null;
    fheInstance: any;
    cachedPassword: string | null;
    auth: AuthModule;
    keyManager: KeyManager;
    encryption: EncryptionModule;
    message: MessageModule;
    dialogue: DialogueModule;
    /**
     * Create a new PrivateMsgSDK instance
     * @param config SDK configuration (optional, uses defaults if not provided)
     */
    constructor(config?: MsgSDKConfig);
    /**
     * Initialize the SDK (must be called before using other methods)
     * @param instance FHE instance from @zama-fhe/relayer-sdk/web createInstance()
     * @param provider Browser wallet provider (e.g., window.ethereum)
     */
    initialize(instance: any, provider: any): Promise<void>;
    /**
     * Set event callbacks for message module
     * @param callbacks Event callback functions
     */
    setCallbacks(callbacks: MsgSDKEventCallbacks): void;
    /**
     * Get the contract address
     * @returns Contract address
     */
    getContractAddress(): string;
    /**
     * Get the current signer address
     * @returns Signer address or null if not connected
     */
    getSignerAddress(): Promise<string | null>;
    /**
     * Check if SDK is initialized
     * @returns True if initialized, false otherwise
     */
    isInitialized(): boolean;
    /**
     * Get protocol ID from contract
     * @returns Protocol ID
     */
    getProtocolId(): Promise<number>;
    /**
     * Login with password
     * - If user is not registered, automatically register
     * - If user is registered, verify password
     * - Cache password on successful login for subsequent operations
     * @param password User's password
     * @returns Login result with status
     */
    login(password: string): Promise<{
        success: boolean;
        isNewUser: boolean;
        message: string;
    }>;
    /**
     * Logout and clear cached password
     */
    logout(): void;
    /**
     * Check if user is logged in (has cached password)
     * @returns True if logged in
     */
    isLoggedIn(): boolean;
    /**
     * Get cached password (for internal use)
     * @returns Cached password or null
     */
    getCachedPassword(): string | null;
    /**
     * Register user with password (shortcut to auth.register)
     * @param password User's password
     * @returns Registration result
     */
    register(password: string): Promise<RegisterResult>;
    /**
     * Check if user is registered (shortcut to auth.isRegistered)
     * @param userAddress User's wallet address
     * @returns True if registered
     */
    isRegistered(userAddress: string): Promise<boolean>;
    /**
     * Verify password (shortcut to auth.verifyPassword)
     * @param userAddress User's wallet address
     * @param password Password to verify
     * @returns True if password is correct
     */
    verifyPassword(userAddress: string, password: string): Promise<boolean>;
    /**
     * Send a message (shortcut to message.sendMessage)
     * - If password is not provided, uses cached password from login
     * @param params Send message parameters (password optional if logged in)
     * @returns Send message result
     */
    sendMessage(params: Omit<SendMessageParams, 'password'> & {
        password?: string;
    }): Promise<SendMessageResult>;
    /**
     * Get all dialogues for a user (shortcut to message.getDialogues)
     * @param userAddress User's wallet address
     * @returns Array of dialogues
     */
    getDialogues(userAddress: string): Promise<Dialogue[]>;
    /**
     * Get messages from a dialogue (shortcut to message.getMessages)
     * - If password is not provided, uses cached password from login
     * @param params Get messages parameters (password optional if logged in)
     * @returns Array of messages
     */
    getMessages(params: Omit<GetMessagesParams, 'password'> & {
        password?: string;
    }): Promise<Message[]>;
    /**
     * Get dialogue with a specific user (shortcut to message.getDialogueWith)
     * - If password is not provided, uses cached password from login
     * @param params Get dialogue with user parameters (password optional if logged in)
     * @returns Dialogue address and messages
     */
    getDialogueWith(params: Omit<GetDialogueWithParams, 'password'> & {
        password?: string;
    }): Promise<GetDialogueWithResult>;
    /**
     * Listen for new messages (shortcut to message.onNewMessage)
     * @param callback Callback function for new messages
     * @returns Unsubscribe function
     */
    onNewMessage(callback: (message: Message) => void): EventUnsubscribe;
    /**
     * Get dialogue address between two users (shortcut to dialogue.getDialogueAddressBetween)
     * @param user1 First user address
     * @param user2 Second user address
     * @returns Dialogue address
     */
    getDialogueAddressBetween(user1: string, user2: string): Promise<string>;
}

/**
 * Constants and configurations
 */
/**
 * Default contract address on Sepolia
 */
declare const DEFAULT_CONTRACT_ADDRESS = "0x9fAA401201d16268AC4A5E16A5EeBFBd3EF890BF";
/**
 * Default RPC URL
 */
declare const DEFAULT_RPC_URL = "https://1rpc.io/sepolia";
/**
 * Blackhole address for type 2 deposits (anyone with password)
 */
declare const BLACKHOLE_ADDRESS = "0x0000000000000000000000000000000000000000";
/**
 * CODE_HASH used in dialogue address calculation
 * Must match the CODE_HASH constant in PrivateMsg.sol contract
 */
declare const CODE_HASH = "0x326792ea9981945c5ee81b1b459d2a986cc13aba6f9335ce16b6dd2e2823f496";
/**
 * Sepolia FHE Configuration (imported from Zama SDK)
 */
declare const SEPOLIA_FHE_CONFIG: _zama_fhe_relayer_sdk_web.FhevmInstanceConfig;
/**
 * Contract ABI
 */
declare const CONTRACT_ABI: ({
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        components: ({
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        } | {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        })[];
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
})[];

export { AuthModule, BLACKHOLE_ADDRESS, CODE_HASH, CONTRACT_ABI, DEFAULT_CONTRACT_ADDRESS, DEFAULT_RPC_URL, type Dialogue, DialogueModule, type EncryptedMessage, EncryptionModule, ErrorCode, type EventUnsubscribe, type GetDialogueWithParams, type GetDialogueWithResult, type GetMessagesParams, KeyManager, type MSGList, type Message, MessageModule, type MsgSDKConfig, type MsgSDKEventCallbacks, type PasswordWallet, PrivateMsgError, PrivateMsgSDK, type RegisterResult, SEPOLIA_FHE_CONFIG, type SendMessageParams, type SendMessageResult };

import mongoose from 'mongoose';

class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apartment-listing-app';
      
      // Connection options for better performance and reliability
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      };

      await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      console.log('✅ Database connected successfully');

      // Handle connection events
      this.setupConnectionHandlers();
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log('Database not connected');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  private setupConnectionHandlers(): void {
    const connection = mongoose.connection;

    // Connection events
    connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    connection.on('error', (error) => {
      console.error('🔴 Mongoose connection error:', error);
      this.isConnected = false;
    });

    connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Received SIGINT, closing database connection...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🛑 Received SIGTERM, closing database connection...');
      await this.disconnect();
      process.exit(0);
    });
  }

  // Health check method
  public async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (!this.isConnectedToDatabase()) {
        return { status: 'error', message: 'Database not connected' };
      }
      // Check if db connection exists
      if (!mongoose.connection.db) {
        return { status: 'error', message: 'Database connection not established' };
      }
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', message: 'Database connection is healthy' };
    } catch (error) {
      return { status: 'error', message: `Database health check failed: ${error}` };
    }
  }

  // Get connection stats
  public getConnectionStats(): any {
    if (!this.isConnected) {
      return { status: 'disconnected' };
    }

    return {
      status: 'connected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Default export for backward compatibility
export default databaseManager;

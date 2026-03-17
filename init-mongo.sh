#!/bin/bash
# init-mongo.sh - Properly initialize MongoDB with data from JSON files

echo "Waiting for MongoDB to be ready..."
until mongosh --host mongodb --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 2
  echo "Still waiting for MongoDB..."
done

echo "MongoDB is ready! Starting data import..."

DB_NAME="Retogen"

# Import each collection
for file in /docker-entrypoint-initdb.d/*.json; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    
    # Extract collection name from filename
    # Handles formats: Retogen.users.json -> users
    collection=$(echo "$filename" | sed 's/^Retogen\.//; s/\.json$//')
    
    echo "Importing collection: $collection from $filename"
    
    # Import the JSON file
    mongoimport --host mongodb \
                --db "$DB_NAME" \
                --collection "$collection" \
                --file "$file" \
                --jsonArray \
                --drop
    
    if [ $? -eq 0 ]; then
      echo "✓ Successfully imported $collection"
      # Count documents
      count=$(mongosh --host mongodb --quiet "$DB_NAME" --eval "db.$collection.countDocuments()")
      echo "  → $count documents in $collection"
    else
      echo "✗ Failed to import $collection"
    fi
  fi
done

echo ""
echo "==================================="
echo "Database initialization complete!"
echo "==================================="
echo ""

# Show summary
mongosh --host mongodb "$DB_NAME" --eval "
  print('Database: $DB_NAME');
  print('Collections:');
  db.getCollectionNames().forEach(function(col) {
    var count = db[col].countDocuments();
    print('  - ' + col + ': ' + count + ' documents');
  });
"

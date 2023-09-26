const buildTree = (paths) =>{
    const tree = [];

    paths.forEach(path => {
      const parts = path.split('/');
      let currentNode = tree;
      let currentPath = '';

      parts.forEach(part => {
        currentPath += (currentPath === '' ? part : '/' + part);
        const existingNode = currentNode.find(node => node.name === part);

        if (existingNode) {
          currentNode = existingNode.children;
        } else {
          const newNode = { name: part, path: currentPath, children: [] };
          currentNode.push(newNode);
          currentNode = newNode.children;
        }
      });
    });

    return tree;
  }

  const paths = [
    'path/to/file1',
    'path/to/file2',
    'path/to/file3',
    // Add more paths as needed
  ];

  const tree = buildTree(paths);

  console.log(JSON.stringify(tree, null, 2)); // Convert to formatted JSON for better visualization

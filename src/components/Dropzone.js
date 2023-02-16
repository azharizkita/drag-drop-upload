import React from 'react';
import {
  Button,
  Divider,
  Flex,
  Spacer,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react';

const ListRenderer = ({ file, handleDeleteFile }) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);

  // mocked upload method
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsUploading(true);
      if (Math.random() < 0.2) {
        // error from BE
        setErrorMessage('Cannot parse this file');
        return;
      }
      setErrorMessage(null);
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Flex gap="0.5em" pl="0.2em" align="center">
        {!isUploading ? (
          <Flex width="0.75em" height="0.75em" align="center" justify="center">
            <Spinner size="sm" color="blue.400" />
          </Flex>
        ) : (
          <Tooltip
            label={errorMessage}
            isDisabled={!Boolean(errorMessage)}
            placement="top"
            hasArrow
          >
            <Flex
              width="0.75em"
              height="0.75em"
              borderRadius="full"
              bg={!Boolean(errorMessage) ? 'green.400' : 'red.400'}
            />
          </Tooltip>
        )}
        <Text
          fontSize="sm"
          align="left"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {file.name}
        </Text>
        <Spacer />
        <Button size="xs" colorScheme="red" onClick={handleDeleteFile}>
          Delete
        </Button>
      </Flex>
      <Divider />
    </>
  );
};

export const Dropzone = ({ onRenderItems = null, children }) => {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const inputFile = React.useRef(null);

  /**
   *
   * @param {React.DragEvent<HTMLDivElement>} e
   * @returns
   */
  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
      return;
    }
    setIsDragActive(false);
  };

  /**
   *
   * @param {React.DragEvent<HTMLDivElement>} e
   * @returns
   */
  const onDropHandler = e => {
    // prevents default behavior so the dropped file won't be viewed/downloaded
    e.preventDefault();
    setIsDragActive(false);
    const dataTransferItems = e.dataTransfer.items;
    if (!dataTransferItems) {
      return;
    }
    const listOfFiles = [...dataTransferItems].reduce(
      (accumulator, currentItem) => {
        // if current item is not a file, reject them
        if (currentItem.kind !== 'file') {
          return accumulator;
        }
        // dropped file will only be accessible via "DataTransferItemList" interface
        // spesificly with getAsFile.
        const currentFile = currentItem.getAsFile();

        if (!currentFile) {
          return accumulator;
        }

        accumulator.push(currentFile);
        return accumulator;
      },
      []
    );

    setFiles(listOfFiles);
  };

  const handleDeleteFile = index => {
    setFiles(_files => {
      _files.splice(index, 1);
      return [..._files];
    });
  };

  const handleOnClick = () => {
    if (!isDroppedFileEmpty) {
      return;
    }
    inputFile.current.click();
  };

  /**
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleOnSelectedFile = e => {
    const _files = e.target.files;
    if (!_files) {
      return;
    }
    const selectedFiles = [...Array(_files.length).keys()].reduce(
      (accumulator, currentIndex) => {
        const currentFile = _files.item(currentIndex);
        if (!currentFile) {
          return accumulator;
        }
        accumulator.push(currentFile);
        return accumulator;
      },
      []
    );
    setFiles(selectedFiles);
  };

  const isDroppedFileEmpty = files.length === 0;

  return (
    <>
      <input
        type="file"
        id="file"
        multiple
        ref={inputFile}
        style={{ display: 'none' }}
        onChange={handleOnSelectedFile}
      />
      <Flex
        transitionDuration="350ms"
        width="100%"
        height="100%"
        borderWidth="medium"
        borderStyle="dashed"
        p="0.25em"
        borderRadius="lg"
        borderColor={isDragActive ? 'blue.400' : ''}
        direction="column"
        overflow="auto"
        cursor={isDroppedFileEmpty ? 'pointer' : 'auto'}
        onClick={handleOnClick}
        onDrop={onDropHandler}
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        gap="0.25em"
      >
        {isDroppedFileEmpty && (
          <Flex
            align="center"
            justify="center"
            direction="column"
            w="100%"
            h="100%"
          >
            {children}
          </Flex>
        )}
        {files.map((file, index) => {
          const uniqueKey = `${file.name}_${file.size}`;
          if (onRenderItems) {
            const CustomListRenderer = onRenderItems({
              file,
              index,
              handleDeleteFile: () => handleDeleteFile(index),
            });
            return (
              <React.Fragment key={uniqueKey}>
                <CustomListRenderer />
              </React.Fragment>
            );
          }
          return (
            <ListRenderer
              file={file}
              key={uniqueKey}
              handleDeleteFile={() => handleDeleteFile(index)}
            />
          );
        })}
      </Flex>
    </>
  );
};

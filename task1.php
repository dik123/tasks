<?php
/**
* Largest repeated subset.
* Find the longest repeated subset of array elements in given array. For example,
* for array('b','r','o','w','n','f','o','x','h','u','n','t','e','r','n','f','o','x','r','y','h','u','n')
* the longest repeated subset will be array('n','f','o','x').
*
* @param array $list
* @return array
*/

function solve(Array $list) {
    $listLength = count($list);

    /**
    * Index of elements positions.
    * Example: for array('a', 'b', 'a', 'c', 1) will contain:
    * Array( 
    *    'a.string'  => Array(0, 2),
    *    'b.string'  => Array(1),
    *    'c.string'  => Array(3),
    *    '1.integer' => Array(4)
    * )
    */
    $index  = array();

    //Start of longest repeated subset in array
    $start  = 0;

    //Length of longest repeated subset in array
    $maxLength = 0;

    foreach($list as $pos => $item){
        // Append type name to index name becase of 
        // keys in array are auto converted to string 
        $item .= '.'.gettype($item);

        if( isset($index[$item])){
           //Position's index for this element exists and we are going to
           //iterate throw all previews positions of element in array

            $itemIndex = &$index[$item];
            foreach($itemIndex as $indexPos){
                $cursorPos = $pos;

                //Compare elements starting from indexed position with
                //elements starting from current position
                do{
                    $cursorPos++;
                    $indexPos++;
                }while(
                    $cursorPos < $listLength
                 && $indexPos  < $pos
                 && $list[$cursorPos] === $list[$indexPos]);

               $cursorLength = $cursorPos - $pos;

               if($cursorLength > $maxLength){
                    $maxLength = $cursorLength;
                    $start = $pos;
                }
            }

            //Add current element's posision to index
            $itemIndex[] = $pos;
        }else{
            //Initilize index for this element
            $index[$item] = array( $pos );
        }
    }

    return  $maxLength ? array_slice($list, $start, $maxLength) : array();
}
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
    $list_length = count($list);

    /**
    * Index of element positions.
    * Example: for array('a', 'b', 'a', 'c') will contain:
    * Array( 
    *    'a' => Array(0, 2),
    *    'b' => Array(1),
    *    'c' => Array(3)
    * )
    */
    $index  = array();

    //Start of longest repeated subset in array
    $start  = 0;

    //Length of longest repeated subset in array
    $max_length = 0;

    foreach($list as $pos => $item){

        if( isset($index[$item])){
           //Position's index for this element exists and we are going to
           //iterate throw all previews positions of element in array

            $item_index = &$index[$item];
            foreach($item_index as $index_pos){
                $cursor_pos = $pos;

                //Compare elements starting from indexed position with
                //elements starting from current position
                do{
                    $cursor_pos++;
                    $index_pos++;
                }while(
                    $cursor_pos < $list_length
                 && $list[$cursor_pos] == $list[$index_pos]);

               $cursor_length = $cursor_pos - $pos;

               //If compare loop ends on out of array then
               //$cursor_pos is longer by one  becase of do..while loop
               //so $cursor_length must be decremented
               if($cursor_pos == $list_length) $cursor_length--;

               if($cursor_length > $max_length){
                    $max_length = $cursor_length;
                    $start = $pos;
                }
            }

            //Add current element's posision to index
            $item_index[] = $pos;
        }else{
            //Initilize index for this element
            $index[$item] = array( $pos );
        }
    }

    return  $max_length ? array_slice($list, $start, $max_length) : array();
}